import React from 'react';
import { FaFile, FaFileCode, FaFileCsv, FaFileVideo, FaFileAudio, FaFileImage, FaDatabase, FaCloud, FaPlug, FaEnvelope, FaMicrochip, FaCheckCircle, FaExchangeAlt, FaFilter, FaMap, FaPaperPlane, FaVideo, FaYoutube, FaImage, FaFont, FaChartBar, FaGlobe, FaFileExport, FaLink, FaClock, FaCodeBranch, FaFileAlt, FaCheckDouble, FaBell, FaBrain, FaCube } from 'react-icons/fa';

const iconMap: Record<string, React.ReactNode> = {
  'json-file': <FaFile />,
  'xml-file': <FaFileCode />,
  'csv-file': <FaFileCsv />,
  'video-file': <FaFileVideo />,
  'audio-file': <FaFileAudio />,
  'image-file': <FaFileImage />,
  'sql-database': <FaDatabase />,
  'nosql-database': <FaDatabase />,
  'rest-api': <FaCloud />,
  'graphql-api': <FaCloud />,
  'websocket': <FaPlug />,
  'form-data': <FaEnvelope />,
  'rss-feed': <FaEnvelope />,
  'email-source': <FaEnvelope />,
  'iot-device': <FaMicrochip />,
  'json-validator': <FaCheckCircle />,
  'xml-transformer': <FaExchangeAlt />,
  'data-filter': <FaFilter />,
  'data-mapper': <FaMap />,
  'email-sender': <FaPaperPlane />,
  'video-transcoder': <FaVideo />,
  'youtube-uploader': <FaYoutube />,
  'image-processor': <FaImage />,
  'text-analyzer': <FaFont />,
  'data-aggregator': <FaChartBar />,
  'http-request': <FaGlobe />,
  'file-writer': <FaFileExport />,
  'database-writer': <FaDatabase />,
  'data-joiner': <FaLink />,
  'scheduler': <FaClock />,
  'conditional-branch': <FaCodeBranch />,
  'template-renderer': <FaFileAlt />,
  'data-validator': <FaCheckDouble />,
  'notification-sender': <FaBell />,
  'ml-predictor': <FaBrain />,
}

export const getIconForNodeType = (type: string): React.ReactNode => {
  return iconMap[type] || <FaCube />;
}