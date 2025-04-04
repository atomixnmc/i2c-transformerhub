import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Header = styled.header`
  background-color: #343a40;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoImage = styled.img`
  height: 32px;
`;

const LogoText = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 16px;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;

  &:hover {
    background-color: #495057;
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  color: black;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10;
`;

const UserMenuItem = styled(Link)`
  display: block;
  padding: 8px 16px;
  text-decoration: none;
  color: black;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background-color: #6c757d;
  border-radius: 50%;
`;

function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Header>
      <LogoContainer>
        <LogoImage src="/logo192.png" alt="App Logo" />
        <LogoText>TransformerHub</LogoText>
      </LogoContainer>
      <Navigation>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/editor">Editor</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </Navigation>
      <UserMenuContainer>
        <UserMenuButton onClick={() => setMenuOpen(!menuOpen)}>
          <UserAvatar />
          User
        </UserMenuButton>
        {menuOpen && (
          <UserMenuDropdown>
            <UserMenuItem to="/login">Login</UserMenuItem>
            <UserMenuItem to="/profile">Profile</UserMenuItem>
            <UserMenuItem to="/logout">Logout</UserMenuItem>
          </UserMenuDropdown>
        )}
      </UserMenuContainer>
    </Header>
  );
}

export default TopNav;
