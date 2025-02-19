import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
`;

const TypingIndicator: React.FC = () => {
  const animation = `${bounce} 1s infinite ease-in-out`;

  return (
    <Box
      position="relative"
      bg="gray.100"
      p={3}
      borderRadius="lg"
      maxW="100px"
    >
      <Flex gap={1}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            width="8px"
            height="8px"
            bg="gray.500"
            borderRadius="full"
            animation={animation}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </Flex>
    </Box>
  );
};

export default TypingIndicator;
