import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Users,
  UserPlus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Heart
} from 'lucide-react';
import { useFamilyTree } from '../hooks/useFamilyTree';
import type { FamilyMember } from '../hooks/useFamilyTree';
import { useAuth } from '../lib/auth';
import { MemberCard } from '../components/family/MemberCard';
import { Button } from '../components/ui/Button';
import { BottomSheet, Modal } from '../components/ui/Modal';
import { EmptyState, LoadingState } from '../components/ui/EmptyState';
import { Avatar } from '../components/ui/Avatar';

type RelationshipType = 'parent' | 'child' | 'spouse' | 'sibling';

type AddMemberForm = {
  full_name: string;
  birth_date: string;
  death_date: string;
  bio: string;
  is_placeholder: boolean;
};

export default function FamilyTree() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const familyTree = useFamilyTree();
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [addingToMember, setAddingToMember] = useState<FamilyMember | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [newMember, setNewMember] = useState<AddMemberForm>({
    full_name: '',
    birth_date: '',
    death_date: '',
    bio: '',
    is_placeholder: true,
  });

  const [selectedRelationType, setSelectedRelationType] = useState<RelationshipType>('parent');

  // Pan and zoom handlers
  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 2));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === treeContainerRef.current || (e.target as HTMLElement).closest('.tree-canvas')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowMemberSheet(true);
  };

  const handleAddMember = async () => {
    if (!newMember.full_name.trim()) return;

    const member = await familyTree.addMember({
      family_id: '',
      user_id: null,
      full_name: newMember.full_name.trim(),
      birth_date: newMember.birth_date || null,
      death_date: newMember.death_date || null,
      avatar_url: null,
      bio: newMember.bio || null,
      is_placeholder: newMember.is_placeholder,
    });

    if (member && addingToMember) {
      await familyTree.addRelationship(
        addingToMember.id,
        member.id,
        selectedRelationType
      );
    }

    setShowAddMember(false);
    setAddingToMember(null);
    setNewMember({
      full_name: '',
      birth_date: '',
      death_date: '',
      bio: '',
      is_placeholder: true,
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this person from the family tree?')) {
      await familyTree.deleteMember(memberId);
      setShowMemberSheet(false);
      setSelectedMember(null);
    }
  };

  const handleStartAddRelationship = (member: FamilyMember) => {
    setAddingToMember(member);
    setShowMemberSheet(false);
    setShowAddRelationship(true);
  };

  const handleAddNewWithRelationship = (relationType: RelationshipType) => {
    setSelectedRelationType(relationType);
    setShowAddRelationship(false);
    setShowAddMember(true);
  };

  const handleAddExistingRelationship = async (relatedMember: FamilyMember) => {
    if (!addingToMember) return;

    await familyTree.addRelationship(
      addingToMember.id,
      relatedMember.id,
      selectedRelationType
    );

    setShowAddRelationship(false);
    setAddingToMember(null);
  };

  // Build visual tree structure
  const buildVisualTree = () => {
    if (familyTree.members.length === 0) return null;

    // Group members by generation
    const generations: Map<number, FamilyMember[]> = new Map();
    const memberGenerations: Map<string, number> = new Map();
    const processed = new Set<string>();

    // Find root members (those without parents in the tree)
    const findGeneration = (memberId: string, gen: number) => {
      if (processed.has(memberId)) return;
      processed.add(memberId);
      memberGenerations.set(memberId, gen);

      if (!generations.has(gen)) {
        generations.set(gen, []);
      }
      const member = familyTree.members.find(m => m.id === memberId);
      if (member) {
        generations.get(gen)!.push(member);
      }

      // Find children
      const relatives = familyTree.getMemberRelatives(memberId);
      relatives.children.forEach(child => {
        findGeneration(child.id, gen + 1);
      });
    };

    // Start from members without parents
    familyTree.members.forEach(member => {
      const relatives = familyTree.getMemberRelatives(member.id);
      if (relatives.parents.length === 0 && !processed.has(member.id)) {
        findGeneration(member.id, 0);
      }
    });

    // Process any remaining unconnected members
    familyTree.members.forEach(member => {
      if (!processed.has(member.id)) {
        findGeneration(member.id, 0);
      }
    });

    return generations;
  };

  const generations = buildVisualTree();

  if (familyTree.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-linen/30">
        <LoadingState message="Loading family tree..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-linen/30 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-heritage-green/10 px-5 py-4 safe-top flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ChevronLeft className="w-6 h-6 text-charcoal-ink" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-heritage-green" />
              <h1 className="heading-3">Family Tree</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setAddingToMember(null);
                setShowAddMember(true);
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </header>

      {familyTree.members.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-5">
          <EmptyState
            icon={<Users className="w-10 h-10 text-heritage-green" />}
            title="Start Your Family Tree"
            description="Add family members to create a beautiful visual representation of your family history"
            action={{
              label: 'Add First Member',
              onClick: () => setShowAddMember(true),
            }}
          />
        </div>
      ) : (
        <>
          {/* Zoom Controls */}
          <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ZoomIn className="w-5 h-5 text-charcoal-ink" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ZoomOut className="w-5 h-5 text-charcoal-ink" />
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Maximize2 className="w-5 h-5 text-charcoal-ink" />
            </button>
          </div>

          {/* Tree Container */}
          <div
            ref={treeContainerRef}
            className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            <div
              className="tree-canvas min-h-full p-8 transition-transform duration-100"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Tree Visualization */}
              <div className="flex flex-col items-center gap-12">
                {generations && Array.from(generations.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([gen, members]) => (
                    <div key={gen} className="relative">
                      {/* Generation Label */}
                      <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:block">
                        <span className="text-xs text-charcoal-ink/40 font-medium uppercase tracking-wider">
                          {gen === 0 ? 'Elders' : gen === 1 ? 'Parents' : gen === 2 ? 'You' : `Gen ${gen + 1}`}
                        </span>
                      </div>

                      {/* Members Row */}
                      <div className="flex items-center justify-center gap-6 flex-wrap">
                        {members.map((member) => {
                          const relatives = familyTree.getMemberRelatives(member.id);
                          const isCurrentUser = member.user_id === user?.id;

                          return (
                            <div key={member.id} className="relative">
                              {/* Spouse Connection */}
                              {relatives.spouse && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 flex items-center">
                                  <div className="w-4 h-0.5 bg-heirloom-gold" />
                                  <Heart className="w-4 h-4 text-heirloom-gold fill-heirloom-gold mx-1" />
                                  <div className="w-4 h-0.5 bg-heirloom-gold" />
                                </div>
                              )}

                              {/* Member Node */}
                              <button
                                onClick={() => handleSelectMember(member)}
                                className={`
                                  group flex flex-col items-center p-3 rounded-2xl
                                  transition-all duration-200 hover:scale-105
                                  ${isCurrentUser
                                    ? 'bg-heritage-green/10 ring-2 ring-heritage-green'
                                    : 'bg-white hover:bg-heritage-green/5'
                                  }
                                  shadow-md hover:shadow-lg
                                `}
                              >
                                <div className="relative">
                                  <Avatar
                                    src={member.avatar_url}
                                    name={member.full_name}
                                    size="xl"
                                    ring={isCurrentUser ? 'green' : 'none'}
                                  />
                                  {member.is_placeholder && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-heirloom-gold rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      ?
                                    </span>
                                  )}
                                  {member.death_date && (
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-charcoal-ink/60 rounded-full flex items-center justify-center text-white text-xs">
                                      †
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 text-center max-w-[100px]">
                                  <p className="font-medium text-charcoal-ink text-sm truncate">
                                    {member.full_name}
                                  </p>
                                  {member.birth_date && (
                                    <p className="text-xs text-charcoal-ink/50">
                                      {new Date(member.birth_date).getFullYear()}
                                      {member.death_date && ` - ${new Date(member.death_date).getFullYear()}`}
                                    </p>
                                  )}
                                </div>

                                {/* Add Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartAddRelationship(member);
                                  }}
                                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-heritage-green text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </button>

                              {/* Connection Line to Children */}
                              {relatives.children.length > 0 && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full">
                                  <div className="w-0.5 h-8 bg-heritage-green/30 mx-auto" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Horizontal Connection Line */}
                      {members.length > 1 && (
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 h-0.5 bg-heritage-green/20"
                          style={{ width: `${(members.length - 1) * 140}px`, marginTop: '32px' }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Member Count */}
          <div className="bg-white border-t border-heritage-green/10 px-5 py-3 flex-shrink-0">
            <p className="text-center text-sm text-charcoal-ink/60">
              <span className="font-medium text-heritage-green">{familyTree.members.length}</span> family members
            </p>
          </div>
        </>
      )}

      {/* Member Detail Sheet */}
      <BottomSheet
        isOpen={showMemberSheet}
        onClose={() => {
          setShowMemberSheet(false);
          setSelectedMember(null);
        }}
        title="Family Member"
      >
        {selectedMember && (
          <MemberCard
            member={selectedMember}
            isCurrentUser={selectedMember.user_id === user?.id}
            relatives={familyTree.getMemberRelatives(selectedMember.id)}
            onEdit={() => {}}
            onDelete={() => handleDeleteMember(selectedMember.id)}
            onAddRelationship={() => handleStartAddRelationship(selectedMember)}
          />
        )}
      </BottomSheet>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => {
          setShowAddMember(false);
          setAddingToMember(null);
        }}
        title="Add Family Member"
      >
        <div className="space-y-4">
          {addingToMember && (
            <div className="bg-heritage-green/5 rounded-xl p-3 flex items-center gap-3">
              <Avatar src={addingToMember.avatar_url} name={addingToMember.full_name} size="sm" />
              <div>
                <p className="body-sm text-charcoal-ink">
                  Adding <span className="font-medium">{selectedRelationType}</span> to {addingToMember.full_name}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="label-uppercase mb-1.5 block">Full Name *</label>
            <input
              type="text"
              value={newMember.full_name}
              onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
              className="input"
              placeholder="Enter full name"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-uppercase mb-1.5 block">Birth Date</label>
              <input
                type="date"
                value={newMember.birth_date}
                onChange={(e) => setNewMember({ ...newMember, birth_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label-uppercase mb-1.5 block">Death Date</label>
              <input
                type="date"
                value={newMember.death_date}
                onChange={(e) => setNewMember({ ...newMember, death_date: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label-uppercase mb-1.5 block">Bio</label>
            <textarea
              value={newMember.bio}
              onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
              className="input min-h-[80px] resize-none"
              placeholder="A short description about this person..."
            />
          </div>

          <label className="flex items-center gap-3 p-3 bg-charcoal-ink/5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={newMember.is_placeholder}
              onChange={(e) => setNewMember({ ...newMember, is_placeholder: e.target.checked })}
              className="w-5 h-5 rounded border-charcoal-ink/30 text-heritage-green focus:ring-heritage-green"
            />
            <div>
              <span className="body-sm font-medium text-charcoal-ink">Placeholder profile</span>
              <p className="text-xs text-charcoal-ink/50">This person doesn't have an app account</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleAddMember}
              disabled={!newMember.full_name.trim()}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Relationship Modal */}
      <Modal
        isOpen={showAddRelationship}
        onClose={() => {
          setShowAddRelationship(false);
          setAddingToMember(null);
        }}
        title="Add Relationship"
      >
        {addingToMember && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-charcoal-ink/10">
              <Avatar
                src={addingToMember.avatar_url}
                name={addingToMember.full_name}
                size="lg"
                className="mx-auto mb-2"
              />
              <p className="font-medium text-charcoal-ink">{addingToMember.full_name}</p>
              <p className="text-sm text-charcoal-ink/50">Select relationship type</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {([
                { type: 'parent' as const, label: 'Parent', icon: '👨‍👩‍👧' },
                { type: 'child' as const, label: 'Child', icon: '👶' },
                { type: 'spouse' as const, label: 'Spouse', icon: '💑' },
                { type: 'sibling' as const, label: 'Sibling', icon: '👫' },
              ]).map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setSelectedRelationType(type)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${selectedRelationType === type
                      ? 'border-heritage-green bg-heritage-green/5'
                      : 'border-charcoal-ink/10 hover:border-heritage-green/30'
                    }
                  `}
                >
                  <span className="text-2xl mb-1 block">{icon}</span>
                  <span className="font-medium text-charcoal-ink">{label}</span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-charcoal-ink/10">
              <Button
                variant="gold"
                fullWidth
                icon={<UserPlus className="w-5 h-5" />}
                onClick={() => handleAddNewWithRelationship(selectedRelationType)}
              >
                Create New {selectedRelationType.charAt(0).toUpperCase() + selectedRelationType.slice(1)}
              </Button>
            </div>

            {familyTree.members.filter(m => m.id !== addingToMember.id).length > 0 && (
              <div className="pt-4 border-t border-charcoal-ink/10">
                <p className="label-uppercase mb-3">Or link existing member</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {familyTree.members
                    .filter(m => m.id !== addingToMember.id)
                    .map((member) => (
                      <button
                        key={member.id}
                        onClick={() => handleAddExistingRelationship(member)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-heritage-green/5 transition-colors border border-charcoal-ink/10"
                      >
                        <Avatar src={member.avatar_url} name={member.full_name} size="sm" />
                        <span className="body-sm font-medium text-charcoal-ink">{member.full_name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
