import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Trash2, Edit2, Link as LinkIcon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { FamilyMember } from '../../hooks/useFamilyTree';

interface MemberCardProps {
  member: FamilyMember;
  isCurrentUser?: boolean;
  relatives?: {
    parents: FamilyMember[];
    children: FamilyMember[];
    spouse: FamilyMember | null;
    siblings: FamilyMember[];
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onAddRelationship?: () => void;
}

export function MemberCard({
  member,
  isCurrentUser = false,
  relatives,
  onEdit,
  onDelete,
  onAddRelationship,
}: MemberCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAge = () => {
    if (!member.birth_date) return null;
    const birthDate = new Date(member.birth_date);
    const endDate = member.death_date ? new Date(member.death_date) : new Date();
    const age = Math.floor(
      (endDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return age;
  };

  const age = getAge();

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <Avatar
          src={member.avatar_url}
          name={member.full_name}
          size="xl"
          ring={isCurrentUser ? 'green' : 'none'}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="heading-3 text-charcoal-ink">{member.full_name}</h3>
            {isCurrentUser && (
              <Badge variant="gold" size="sm">You</Badge>
            )}
            {member.is_placeholder && (
              <Badge variant="default" size="sm">Placeholder</Badge>
            )}
          </div>

          {(member.birth_date || age !== null) && (
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-charcoal-ink/40" />
              <span className="body-sm text-charcoal-ink/60">
                {formatDate(member.birth_date)}
                {member.death_date && ` – ${formatDate(member.death_date)}`}
                {age !== null && ` (${age} ${member.death_date ? 'years old' : 'years old'})`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {member.bio && (
        <div>
          <p className="body-md text-charcoal-ink/80 leading-relaxed">{member.bio}</p>
        </div>
      )}

      {/* Relationships */}
      {relatives && (
        <div className="space-y-3">
          {relatives.spouse && (
            <div>
              <p className="caption text-charcoal-ink/50 mb-1">Spouse</p>
              <div className="flex items-center gap-2">
                <Avatar src={relatives.spouse.avatar_url} name={relatives.spouse.full_name} size="sm" />
                <span className="body-sm text-charcoal-ink">{relatives.spouse.full_name}</span>
              </div>
            </div>
          )}

          {relatives.parents.length > 0 && (
            <div>
              <p className="caption text-charcoal-ink/50 mb-1">Parents</p>
              <div className="flex flex-wrap gap-2">
                {relatives.parents.map(parent => (
                  <div key={parent.id} className="flex items-center gap-2">
                    <Avatar src={parent.avatar_url} name={parent.full_name} size="sm" />
                    <span className="body-sm text-charcoal-ink">{parent.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatives.siblings.length > 0 && (
            <div>
              <p className="caption text-charcoal-ink/50 mb-1">Siblings</p>
              <div className="flex flex-wrap gap-2">
                {relatives.siblings.map(sibling => (
                  <div key={sibling.id} className="flex items-center gap-2">
                    <Avatar src={sibling.avatar_url} name={sibling.full_name} size="sm" />
                    <span className="body-sm text-charcoal-ink">{sibling.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatives.children.length > 0 && (
            <div>
              <p className="caption text-charcoal-ink/50 mb-1">Children</p>
              <div className="flex flex-wrap gap-2">
                {relatives.children.map(child => (
                  <div key={child.id} className="flex items-center gap-2">
                    <Avatar src={child.avatar_url} name={child.full_name} size="sm" />
                    <span className="body-sm text-charcoal-ink">{child.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-charcoal-ink/10">
        {member.user_id && (
          <Button
            variant="secondary"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            onClick={() => navigate(`/vault?user=${member.user_id}`)}
          >
            View Stories
          </Button>
        )}

        {onAddRelationship && (
          <Button
            variant="ghost"
            size="sm"
            icon={<LinkIcon className="w-4 h-4" />}
            onClick={onAddRelationship}
          >
            Add Relationship
          </Button>
        )}

        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={onEdit}
          >
            Edit
          </Button>
        )}

        {onDelete && !isCurrentUser && (
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onDelete}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

export default MemberCard;
