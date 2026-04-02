import React from 'react';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';
import SidebarCreateNew from './SidebarCreateNew';

const Sidebar = () => {
  return (
    <aside className="mk-sidebar">
      <SidebarLogo />
      <SidebarMenu />
      <SidebarCreateNew />
    </aside>
  );
};

export default Sidebar;


