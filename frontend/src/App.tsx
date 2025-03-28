import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import FlowEditor from './components/FlowEditor';

const AppContainer = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  background-color: #343a40;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
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

const HomePage = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
`;

const HomeTitle = styled.h1`
  font-size: 36px;
  margin-bottom: 16px;
`;

const HomeDescription = styled.p`
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 24px;
  color: #495057;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 12px;
`;

const CardDescription = styled.p`
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 16px;
`;

const Button = styled(Link)`
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    background-color: #0069d9;
  }
`;

function Home() {
  return (
    <HomePage>
      <HomeTitle>Welcome to TransformerHub</HomeTitle>
      <HomeDescription>
        TransformerHub is a powerful dataflow editor that allows you to create, configure, and execute data transformation workflows visually. Connect data sources to actions and build complex data processing pipelines without writing code.
      </HomeDescription>
      
      <Button to="/editor">Create New Flow</Button>
      
      <CardContainer>
        <Card>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>
            Connect to various data sources including JSON, XML, CSV files, databases, APIs, and more.
          </CardDescription>
        </Card>
        
        <Card>
          <CardTitle>Transformations</CardTitle>
          <CardDescription>
            Process and transform your data with validators, mappers, filters, and other powerful operations.
          </CardDescription>
        </Card>
        
        <Card>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Send emails, upload videos, make HTTP requests, and perform other actions based on your data.
          </CardDescription>
        </Card>
      </CardContainer>
    </HomePage>
  );
}

function App() {
  return (
    <Router>
      <AppContainer>
        <Header>
          <Logo>TransformerHub</Logo>
          <Navigation>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/editor">Editor</NavLink>
          </Navigation>
        </Header>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<FlowEditor />} />
          <Route path="/editor/:flowId" element={<FlowEditor />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
