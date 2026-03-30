import React, { useRef, useState } from 'react';
import { Button, Flex, Text, Image, Badge } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import SCWidgetCard from './sc-widget-card';
import { WidgetConfig } from '@/PageComponents/Dashboard/DashboardModels';
import Fetch from '@/utils/Fetch';

interface SCWidgetFeedbearProps {
  widget: WidgetConfig;
  onDismiss?: () => void;
}

const SCWidgetFeedbear: React.FC<SCWidgetFeedbearProps> = ({ widget, onDismiss }) => {
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `https://servcraft.feedbear.com/sso/auth?payload=${response.fbsessiontoken}`;
        iframeRef.current = iframe;
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          setTimeout(() => {
            window.open('https://servcraft.feedbear.com/roadmap', '_blank');
            if (iframeRef.current?.parentNode) {
              document.body.removeChild(iframeRef.current);
            }
            iframeRef.current = null;
            setIsLoading(false);
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Failed to get Feedbear SSO URL:', error);
      setIsLoading(false);
    }
  };

  return (
    <SCWidgetCard height={widget.heightPX} onDismiss={onDismiss}>
      <Flex direction="row" gap="xl" h="100%" align="center">
        <Flex direction="column" gap="md" style={{ flex: 1 }}>          
          <Text size="xl" fw={700} lh={1.3}>
            Our roadmap, your ideas.
          </Text>
          
          <Text size="sm" lh={1.5}>
            Submit your ideas and see what features are coming soon.
          </Text>

          <Button
            size="sm"
            onClick={handleFeedbackClick}
            loading={isLoading}
            mt="xs"
            w="fit-content"
          >
            Suggest and Explore
          </Button>
        </Flex>

        <Image
          src="/widgets/feedbear-kanban.png"
          alt="Roadmap"
          w={280}
          h="auto"
          fit="contain"
          style={{ flexShrink: 0 }}
        />
      </Flex>
    </SCWidgetCard>
  );
};

export default SCWidgetFeedbear;