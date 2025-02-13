import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    navigate('/login');
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Flex mb={8}>
        <Heading>Dashboard</Heading>
        <Spacer />
        <Button colorScheme="blue" onClick={handleLogout}>
          Logout
        </Button>
      </Flex>

      <Box p={6} borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack align="stretch" spacing={4}>
          <Heading size="md">Welcome, {user?.name}!</Heading>
          
          <Box>
            <Text fontWeight="bold">Profile Information:</Text>
            <Text>Email: {user?.email}</Text>
            {user?.enneagramType && (
              <Text>Enneagram Type: {user.enneagramType}
                {user.enneagramWing && `w${user.enneagramWing}`}
              </Text>
            )}
          </Box>

          {!user?.enneagramType && (
            <Box>
              <Text color="gray.600">
                Take our assessment to discover your Enneagram type and receive personalized insights.
              </Text>
              <Button
                mt={4}
                colorScheme="blue"
                variant="outline"
                onClick={() => navigate('/assessment')}
              >
                Start Assessment
              </Button>
            </Box>
          )}
        </VStack>
      </Box>
    </Container>
  );
};

export default Dashboard;
