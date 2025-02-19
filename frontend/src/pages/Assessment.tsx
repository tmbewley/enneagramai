import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Radio,
  RadioGroup,
  Progress,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    type: number;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "When facing a new situation, I typically:",
    options: [
      { text: "Analyze all possibilities before acting", type: 5 },
      { text: "Trust my gut instinct and take action", type: 8 },
      { text: "Consider how it affects others involved", type: 2 }
    ]
  },
  {
    id: 2,
    text: "I feel most fulfilled when:",
    options: [
      { text: "I achieve my goals and succeed", type: 3 },
      { text: "I maintain peace and harmony", type: 9 },
      { text: "I'm recognized for my uniqueness", type: 4 }
    ]
  },
  {
    id: 3,
    text: "My biggest fear is:",
    options: [
      { text: "Being controlled or violated", type: 6 },
      { text: "Being ordinary or inadequate", type: 4 },
      { text: "Being wrong or corrupt", type: 1 }
    ]
  },
  // Add more questions as needed
];

const Assessment: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: parseInt(value)
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateEnneagramType = () => {
    const typeCounts: { [key: number]: number } = {};
    Object.values(answers).forEach(type => {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominantType = 0;
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = parseInt(type);
      }
    });
    
    return dominantType;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Please answer all questions",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    const enneagramType = calculateEnneagramType();

    try {
      await axios.patch('/api/users/profile', {
        enneagramType
      });

      toast({
        title: "Assessment Complete!",
        description: `Your dominant Enneagram type is Type ${enneagramType}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Error saving results",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading mb={2}>Enneagram Assessment</Heading>
          <Text color="gray.600">
            Discover your Enneagram type through this assessment
          </Text>
        </Box>

        <Progress value={progress} size="sm" colorScheme="blue" />
        
        <Box p={6} borderWidth={1} borderRadius={8} boxShadow="lg">
          <VStack spacing={6} align="stretch">
            <Text fontSize="lg" fontWeight="bold">
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            
            <Text>{questions[currentQuestion].text}</Text>

            <RadioGroup
              onChange={handleAnswer}
              value={answers[currentQuestion]?.toString()}
            >
              <VStack align="stretch" spacing={4}>
                {questions[currentQuestion].options.map((option, index) => (
                  <Radio key={index} value={option.type.toString()}>
                    {option.text}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </VStack>
        </Box>

        <Flex justify="space-between">
          <Button
            onClick={handlePrevious}
            isDisabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Submit
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              onClick={handleNext}
              isDisabled={!answers[currentQuestion]}
            >
              Next
            </Button>
          )}
        </Flex>
      </VStack>
    </Container>
  );
};

export default Assessment;
