import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string | null;
  full_name: string;
  birth_date: string | null;
  death_date: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_placeholder: boolean;
  created_by: string;
  created_at: string;
}

export interface FamilyRelationship {
  id: string;
  family_id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: 'parent' | 'child' | 'spouse' | 'sibling';
}

export interface TreeNode {
  member: FamilyMember;
  spouse?: FamilyMember;
  children: TreeNode[];
  parents: FamilyMember[];
  siblings: FamilyMember[];
  generation: number;
}

interface UseFamilyTreeResult {
  members: FamilyMember[];
  relationships: FamilyRelationship[];
  treeNodes: TreeNode[];
  currentUserNode: TreeNode | null;
  loading: boolean;
  error: string | null;
  addMember: (member: Omit<FamilyMember, 'id' | 'created_at' | 'created_by'>) => Promise<FamilyMember | null>;
  updateMember: (id: string, updates: Partial<FamilyMember>) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  addRelationship: (personId: string, relatedPersonId: string, type: FamilyRelationship['relationship_type']) => Promise<boolean>;
  removeRelationship: (personId: string, relatedPersonId: string) => Promise<boolean>;
  getMemberRelatives: (memberId: string) => {
    parents: FamilyMember[];
    children: FamilyMember[];
    spouse: FamilyMember | null;
    siblings: FamilyMember[];
  };
  refresh: () => Promise<void>;
}

export function useFamilyTree(familyId?: string): UseFamilyTreeResult {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [relationships, setRelationships] = useState<FamilyRelationship[]>([]);
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(familyId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's primary family if not specified
  useEffect(() => {
    if (!familyId && user) {
      supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            setActiveFamilyId(data.family_id);
          }
        });
    }
  }, [familyId, user]);

  const fetchFamilyTree = useCallback(async () => {
    if (!activeFamilyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all members
      const { data: membersData, error: membersError } = await supabase
        .from('family_tree_members')
        .select('*')
        .eq('family_id', activeFamilyId)
        .order('birth_date', { ascending: true, nullsFirst: false });

      if (membersError) throw membersError;

      // Fetch all relationships
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from('family_relationships')
        .select('*')
        .eq('family_id', activeFamilyId);

      if (relationshipsError) throw relationshipsError;

      setMembers(membersData || []);
      setRelationships(relationshipsData || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching family tree:', err);
      setError('Failed to load family tree');
    } finally {
      setLoading(false);
    }
  }, [activeFamilyId]);

  useEffect(() => {
    fetchFamilyTree();
  }, [fetchFamilyTree]);

  const getMemberRelatives = useCallback((memberId: string) => {
    const parents: FamilyMember[] = [];
    const children: FamilyMember[] = [];
    const siblings: FamilyMember[] = [];
    let spouse: FamilyMember | null = null;

    relationships.forEach(rel => {
      if (rel.person_id === memberId) {
        const relatedMember = members.find(m => m.id === rel.related_person_id);
        if (!relatedMember) return;

        switch (rel.relationship_type) {
          case 'child':
            children.push(relatedMember);
            break;
          case 'spouse':
            spouse = relatedMember;
            break;
          case 'sibling':
            siblings.push(relatedMember);
            break;
          case 'parent':
            parents.push(relatedMember);
            break;
        }
      }
      if (rel.related_person_id === memberId) {
        const relatedMember = members.find(m => m.id === rel.person_id);
        if (!relatedMember) return;

        // Inverse relationships
        switch (rel.relationship_type) {
          case 'parent':
            children.push(relatedMember);
            break;
          case 'child':
            parents.push(relatedMember);
            break;
          case 'spouse':
            spouse = relatedMember;
            break;
          case 'sibling':
            siblings.push(relatedMember);
            break;
        }
      }
    });

    return { parents, children, spouse, siblings };
  }, [members, relationships]);

  // Build tree structure
  const buildTree = useCallback((): TreeNode[] => {
    if (members.length === 0) return [];

    const nodesMap = new Map<string, TreeNode>();

    // Create initial nodes
    members.forEach(member => {
      const relatives = getMemberRelatives(member.id);
      nodesMap.set(member.id, {
        member,
        spouse: relatives.spouse || undefined,
        children: [],
        parents: relatives.parents,
        siblings: relatives.siblings,
        generation: 0,
      });
    });

    // Find root nodes (members without parents in our tree)
    const roots: TreeNode[] = [];
    nodesMap.forEach((node) => {
      if (node.parents.length === 0) {
        roots.push(node);
      }
    });

    // Assign generations and build child relationships
    const assignGenerations = (node: TreeNode, gen: number, visited: Set<string>) => {
      if (visited.has(node.member.id)) return;
      visited.add(node.member.id);

      node.generation = gen;
      const relatives = getMemberRelatives(node.member.id);

      relatives.children.forEach(child => {
        const childNode = nodesMap.get(child.id);
        if (childNode && !visited.has(child.id)) {
          node.children.push(childNode);
          assignGenerations(childNode, gen + 1, visited);
        }
      });
    };

    const visited = new Set<string>();
    roots.forEach(root => {
      assignGenerations(root, 0, visited);
    });

    return roots;
  }, [members, getMemberRelatives]);

  const treeNodes = buildTree();

  // Find current user's node
  const currentUserNode = user
    ? treeNodes.find(node => {
        const findUserNode = (n: TreeNode): TreeNode | null => {
          if (n.member.user_id === user.id) return n;
          for (const child of n.children) {
            const found = findUserNode(child);
            if (found) return found;
          }
          return null;
        };
        return findUserNode(node);
      }) || null
    : null;

  const addMember = async (
    member: Omit<FamilyMember, 'id' | 'created_at' | 'created_by'>
  ): Promise<FamilyMember | null> => {
    if (!user || !activeFamilyId) return null;

    try {
      const { data, error } = await supabase
        .from('family_tree_members')
        .insert({
          ...member,
          family_id: activeFamilyId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setMembers(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding member:', err);
      return null;
    }
  };

  const updateMember = async (id: string, updates: Partial<FamilyMember>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_tree_members')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
      return true;
    } catch (err) {
      console.error('Error updating member:', err);
      return false;
    }
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_tree_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== id));
      setRelationships(prev =>
        prev.filter(r => r.person_id !== id && r.related_person_id !== id)
      );
      return true;
    } catch (err) {
      console.error('Error deleting member:', err);
      return false;
    }
  };

  const addRelationship = async (
    personId: string,
    relatedPersonId: string,
    type: FamilyRelationship['relationship_type']
  ): Promise<boolean> => {
    if (!activeFamilyId) return false;

    try {
      const { data, error } = await supabase
        .from('family_relationships')
        .insert({
          family_id: activeFamilyId,
          person_id: personId,
          related_person_id: relatedPersonId,
          relationship_type: type,
        })
        .select()
        .single();

      if (error) throw error;
      setRelationships(prev => [...prev, data]);
      return true;
    } catch (err) {
      console.error('Error adding relationship:', err);
      return false;
    }
  };

  const removeRelationship = async (personId: string, relatedPersonId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('family_relationships')
        .delete()
        .or(`and(person_id.eq.${personId},related_person_id.eq.${relatedPersonId}),and(person_id.eq.${relatedPersonId},related_person_id.eq.${personId})`);

      if (error) throw error;
      setRelationships(prev =>
        prev.filter(
          r =>
            !(r.person_id === personId && r.related_person_id === relatedPersonId) &&
            !(r.person_id === relatedPersonId && r.related_person_id === personId)
        )
      );
      return true;
    } catch (err) {
      console.error('Error removing relationship:', err);
      return false;
    }
  };

  return {
    members,
    relationships,
    treeNodes,
    currentUserNode,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    addRelationship,
    removeRelationship,
    getMemberRelatives,
    refresh: fetchFamilyTree,
  };
}

export default useFamilyTree;
