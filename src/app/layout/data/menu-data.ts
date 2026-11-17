import { MenuItem } from '../../Models/menu-item.model';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'grid',
    children: [
      { id: 'overview', label: 'Overview' },
      { id: 'activity', label: 'Activity' },
      { id: 'insights', label: 'Insights' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'folder',
    children: [
      { id: 'active', label: 'Active' },
      { id: 'archived', label: 'Archived' },
      { id: 'templates', label: 'Templates' },
      { id: 'shared-with-me', label: 'Shared with me' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'people',
    children: [
      { id: 'members', label: 'Members' },
      { id: 'roles', label: 'Roles & permissions' },
      { id: 'invites', label: 'Pending invites' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'chart',
    children: [
      { id: 'usage', label: 'Usage' },
      { id: 'billing', label: 'Billing' },
      { id: 'exports', label: 'Exports' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'gear',
    children: [
      { id: 'general', label: 'General' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'integrations', label: 'Integrations' },
      { id: 'security', label: 'Security' },
    ],
  },
];
