import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Badge,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import ChatInterface from '../components/ChatInterface';

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
    <Container maxW="container.xl" py={8}>
      <Flex mb={8} align="center">
        <Heading>Enneagram AI</Heading>
        <Spacer />
        {user ? (
          <Button colorScheme="blue" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <Button colorScheme="blue" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        )}
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 2fr" }} gap={8}>
        {user && (
          <GridItem>
            <Box p={6} borderWidth={1} borderRadius={8} boxShadow="lg">
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Welcome, {user.name}!</Heading>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Profile Information:</Text>
                  <Text>Email: {user.email}</Text>
                  {user.enneagramType ? (
                    <Flex align="center" mt={2}>
                      <Text>Enneagram Type:</Text>
                      <Badge ml={2} colorScheme="blue">
                        Type {user.enneagramType}
                        {user.enneagramWing && `w${user.enneagramWing}`}
                      </Badge>
                    </Flex>
                  ) : (
                    <Box mt={4}>
                      <Text color="gray.600" mb={4}>
                        Take our assessment to discover your Enneagram type and receive personalized insights.
                      </Text>
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => navigate('/assessment')}
                      >
                        Start Assessment
                      </Button>
                    </Box>
                  )}
                </Box>
              </VStack>
            </Box>
          </GridItem>
        )}
        
        <GridItem colSpan={{ base: 1, lg: user ? 1 : 2 }}>
          <ChatInterface />
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Dashboard;
