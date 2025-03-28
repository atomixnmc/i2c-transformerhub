# TransformerHub

TransformerHub is an event-driven integration system prototype that provides a visual dataflow editor for creating, configuring, and executing data transformation workflows without writing code.

## Features

- **Visual Dataflow Editor**: Create complex data processing pipelines by connecting nodes in a visual interface
- **15 Data Source Nodes**: Connect to various data sources including JSON, XML, CSV files, databases, APIs, and more
- **20 Action Nodes**: Process and transform data with validators, mappers, filters, and perform actions like sending emails or uploading videos
- **Property Editor**: Configure node properties through a user-friendly interface
- **Flow Execution**: Execute, pause, resume, and stop dataflow networks
- **Shared Runtime**: Backend and frontend share the same runtime library for consistent execution

## Project Structure

```
TransformerHub/
├── backend/             # Node.js/Express backend
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── config.js        # Configuration
│   ├── server.js        # Express server
│   └── index.js         # Entry point
├── frontend/            # React frontend
│   ├── public/          # Static files
│   └── src/             # Source code
│       ├── components/  # React components
│       ├── services/    # API services
│       └── types/       # TypeScript definitions
└── shared/              # Shared code between frontend and backend
    ├── dataSourceNodes.js  # Data source node definitions
    ├── actionNodes.js      # Action node definitions
    └── runtime.js          # Shared runtime library
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (optional, can use in-memory storage)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/atomixnmc/i2c-transformerhub.git
cd i2c-transformerhub
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables (optional):
Create a `.env` file in the backend directory with the following variables:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/transformerhub
USE_MONGODB=true
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Creating a New Flow

1. Navigate to the Editor page
2. Drag data source nodes from the left sidebar onto the canvas
3. Drag action nodes onto the canvas
4. Connect nodes by dragging from output handles to input handles
5. Configure node properties by clicking on a node and using the property editor
6. Enter a name for your flow in the top control panel
7. Click "Save" to save your flow
8. Click "Execute" to run the flow

### Available Node Types

#### Data Source Nodes

- **JSON File**: Load data from JSON files
- **XML File**: Load data from XML files
- **CSV File**: Load data from CSV files
- **Video File**: Load video files for processing
- **Audio File**: Load audio files for processing
- **Image File**: Load image files for processing
- **SQL Database**: Connect to SQL databases
- **NoSQL Database**: Connect to NoSQL databases
- **REST API**: Fetch data from REST APIs
- **GraphQL API**: Fetch data from GraphQL APIs
- **WebSocket**: Connect to WebSocket endpoints
- **Form Data**: Process form submissions
- **RSS Feed**: Load data from RSS feeds
- **Email Source**: Process incoming emails
- **IoT Device**: Connect to IoT devices

#### Action Nodes

- **JSON Validator**: Validate JSON data against schemas
- **XML Transformer**: Transform XML data
- **Data Filter**: Filter data based on conditions
- **Data Mapper**: Map data from one structure to another
- **Email Sender**: Send emails
- **Video Transcoder**: Transcode video files
- **YouTube Uploader**: Upload videos to YouTube
- **Image Processor**: Process and transform images
- **Text Analyzer**: Analyze text content
- **Data Aggregator**: Aggregate data from multiple sources
- **HTTP Request**: Make HTTP requests
- **File Writer**: Write data to files
- **Database Writer**: Write data to databases
- **Data Joiner**: Join data from multiple sources
- **Scheduler**: Schedule tasks
- **Conditional Branch**: Create conditional logic
- **Template Renderer**: Render templates with data
- **Data Validator**: Validate data against rules
- **Notification Sender**: Send notifications
- **ML Predictor**: Make predictions using ML models

## Development

### Backend

The backend is built with Node.js and Express, providing RESTful APIs for managing and executing flows. It uses MongoDB for persistence (with an in-memory fallback option).

Key files:
- `server.js`: Express server setup
- `routes/flows.js`: Flow management endpoints
- `routes/nodeTypes.js`: Node type information endpoints
- `models/Flow.js`: MongoDB model for flows

### Frontend

The frontend is built with React and TypeScript, using React Flow for the visual dataflow editor.

Key components:
- `FlowEditor.tsx`: Main editor component
- `CustomNode.tsx`: Visual representation of nodes
- `PropertyEditor.tsx`: Interface for editing node properties

### Shared Runtime

The shared runtime library provides the execution engine for dataflow networks, used by both the frontend and backend.

Key classes:
- `Runtime`: Executes dataflow networks
- `NodeFactory`: Creates node instances
- `FlowManager`: Manages flow definitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by visual programming tools like Node-RED and Rete.js
- Built with React, TypeScript, and Node.js
