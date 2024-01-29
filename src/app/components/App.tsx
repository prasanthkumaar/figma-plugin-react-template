import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { BxSearch, Link, IconButton } from '@opengovsg/design-system-react';
import React, { useState } from 'react';

function handleZoomClicked(id: string): void {
  parent.postMessage({ pluginMessage: { type: 'nodeId', id } }, '*');
}

function App() {

  const [nodes, setNodes] = useState<SimplifiedNodeData[]>([]);
  const [noInstancesSelected, setNoInstancesSelected] = useState<boolean>(false);


  React.useEffect(() => {


    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;

      if (message.type === 'haveInstances') {
        setNodes(message.nodes);
        setNoInstancesSelected(false);

      } else if (message.type === 'noInstances') {
        setNodes([]);
        setNoInstancesSelected(true);

      }

      else { console.error('Received data is not in the expected format or type'); }
    };

    // Clean up the event listener when the component unmounts
    return () => {
      window.onmessage = null;
    };

  }, []);


  const renderNoInstancesSelected = () => (
    <div>
      <div>No instances selected</div>
      <div>Please select one or more instance nodes in the Figma document to see their properties here.</div>
      {/* Include any additional divs or content as needed */}
    </div>
  );

  // Render logic
  const renderedContent = nodes.length > 0 ? (
    <Flex w='100%' gap='40px' flexDirection='column' py='16px'>

      <Flex flexDirection='column' gap='2px'>
        <Text textStyle="subhead-1" fontWeight='600'>Found {nodes.length} instances:</Text>
        <Text textStyle="body-1">From [OGP] Base Design System</Text>
      </Flex>


      {nodes.map((node) => (
        <Flex flexDirection='column' gap='40px'>
          <Flex gap='12px' flexDirection='column'>
            <Flex w='100%' h="150px" background={'#F8F9F9'} justifyContent='center' alignItems='center' alignSelf='stretch'>
              {/* colors.base.canvas.alt */}

              <Box w='174px' h='44px' background={'black'} />
              {/* Replace this box with the actual component */}
            </Flex>

            <Flex flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
              <Flex flexDirection='column' gap='4px'>
                <Text textStyle="subhead-2" color={"black"}>{node.name}</Text>
                {/* colors.base.content.medium */}
                <Link href={node.documentationLink} isExternal size="sm" variant="standalone" p='0px'>View documentation</Link>
              </Flex>

              <IconButton
                icon={<BxSearch />}
                size="md"
                textStyle="subhead-1"
                variant="clear"
                colorScheme='grey'
                aria-label='Zoom into instance'
                onClick={() => handleZoomClicked(node.id)}>
              </IconButton>
            </Flex>
          </Flex>
          <Divider />
        </Flex>

      ))}
    </Flex>
  ) : noInstancesSelected ? renderNoInstancesSelected() : <p>Loading...</p>;


  return (
    <Flex px="16px">{renderedContent}</Flex>
  );
}

export default App;