import { Avatar } from '../ui/Avatar';
import type { FamilyMember } from '../../hooks/useFamilyTree';

interface FamilyTreeNodeProps {
  member: FamilyMember;
  isCurrentUser?: boolean;
  onSelect: (member: FamilyMember) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FamilyTreeNode({
  member,
  isCurrentUser = false,
  onSelect,
  size = 'md',
}: FamilyTreeNodeProps) {
  const sizeClasses = {
    sm: 'w-16',
    md: 'w-20',
    lg: 'w-24',
  };

  const avatarSize = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  };

  const getBirthYear = () => {
    if (!member.birth_date) return null;
    return new Date(member.birth_date).getFullYear();
  };

  const getDeathYear = () => {
    if (!member.death_date) return null;
    return new Date(member.death_date).getFullYear();
  };

  const birthYear = getBirthYear();
  const deathYear = getDeathYear();

  return (
    <button
      onClick={() => onSelect(member)}
      className={`
        ${sizeClasses[size]} flex flex-col items-center gap-1 p-2 rounded-xl
        transition-all hover:bg-heritage-green/5 active:scale-95
        ${isCurrentUser ? 'ring-2 ring-heritage-green ring-offset-2' : ''}
      `}
    >
      <Avatar
        src={member.avatar_url}
        name={member.full_name}
        size={avatarSize[size]}
        ring={isCurrentUser ? 'green' : 'none'}
      />
      <div className="text-center">
        <p className="caption font-medium text-charcoal-ink truncate max-w-full">
          {member.full_name.split(' ')[0]}
        </p>
        {birthYear && (
          <p className="text-[10px] text-charcoal-ink/40">
            {birthYear}{deathYear ? `–${deathYear}` : ''}
          </p>
        )}
      </div>
      {member.is_placeholder && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-heirloom-gold rounded-full flex items-center justify-center">
          <span className="text-[8px] text-white">?</span>
        </span>
      )}
    </button>
  );
}

export default FamilyTreeNode;
