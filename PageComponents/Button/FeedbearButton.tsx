import React, { useState } from 'react';
import { Button, ActionIcon, Tooltip } from '@mantine/core';
import { IconMessageShare } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Fetch from '../../utils/Fetch';

interface FeedbearButtonProps {
  collapsed?: boolean;
}

const FeedbearButton: React.FC<FeedbearButtonProps> = ({ collapsed = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { refetch } = useQuery({
    queryKey: ['feedbear-token'],
    queryFn: () => Fetch.get({ url: '/feedbear/fbsessiontoken' }),
    enabled: false,
  });

  const handleFeedbackClick = async () => {
    setIsLoading(true);
    try {
      const { data: response } = await refetch();
      
      if (response?.fbsessiontoken) {
        window.open(`https://servcraft.feedbear.com/sso/auth?payload=${response.fbsessiontoken}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to get Feedbear SSO URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (collapsed) {
    return (
      <Tooltip label="Give feedback" position="right" withArrow>
        <ActionIcon
          size="lg"
          onClick={handleFeedbackClick}
          loading={isLoading}
          variant="light"
          color="blue.4"
          styles={{
            root: {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              }
            }
          }}
        >
          <IconMessageShare size={20} />
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Button
      fullWidth
      leftSection={<IconMessageShare size={20} />}
      onClick={handleFeedbackClick}
      loading={isLoading}
      variant="light"
      size="sm"
      styles={{
        root: {
          backgroundColor: '#ffffff20',
          color: 'white',
          '&:hover': {
            backgroundColor: '#ffffff40',
          }
        }
      }}
    >
      Give feedback
    </Button>
  );
};

export default FeedbearButton;