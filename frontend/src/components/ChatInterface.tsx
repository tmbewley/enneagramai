import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  useToast,
  InputGroup,
  InputRightElement,
  Divider,
  Badge,
} from '@chakra-ui/react';
import socketService from '../services/socketService';
import TypingIndicator from './TypingIndicator';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    // Listen for typing events
    socketService.onUserTyping(({ typing }) => {
      setIsTyping(typing);
    });

    // Cleanup on unmount
    return () => {
      socketService.removeTypingListener();
      socketService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleTyping = useCallback(() => {
    if (user?._id) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing start
      socketService.emitTypingStart(user._id);

      // Set new timeout to emit typing end
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emitTypingEnd(user._id);
      }, 1000);
    }
  }, [user?._id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: inputMessage,
        userId: user?._id, // Optional - only sent if user is authenticated
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.message,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      height="600px"
      display="flex"
      flexDirection="column"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold">
          Chat with Enneagram AI
        </Text>
        {user && (
          <Badge colorScheme="green">History Saved</Badge>
        )}
      </Flex>
      <Divider mb={4} />
      
      <VStack
        flex="1"
        overflowY="auto"
        spacing={4}
        align="stretch"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.200',
            borderRadius: '24px',
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            maxW="80%"
          >
            <Box
              bg={message.sender === 'user' ? 'blue.500' : 'gray.100'}
              color={message.sender === 'user' ? 'white' : 'black'}
              p={3}
              borderRadius="lg"
            >
              <Text>{message.content}</Text>
              {message.sender === 'ai' && isTyping && <TypingIndicator />}
            </Box>
            <Text
              fontSize="xs"
              color="gray.500"
              textAlign={message.sender === 'user' ? 'right' : 'left'}
              mt={1}
            >
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </VStack>

      <Box mt={4}>
        <InputGroup size="md">
          <Input
            pr="4.5rem"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleSendMessage}
              isLoading={isLoading}
              colorScheme="blue"
            >
              Send
            </Button>
          </InputRightElement>
        </InputGroup>
        {!user && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            Sign in to save your chat history and track your progress
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default ChatInterface;
