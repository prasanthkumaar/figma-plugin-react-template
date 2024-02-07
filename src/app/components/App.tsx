import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import { BxSearch, Link, IconButton, Button } from '@opengovsg/design-system-react';
import React, { useState } from 'react';


function handleRemoveButtonClicked(): void {
  parent.postMessage({ pluginMessage: { type: 'remove-annotations' } }, '*');
}

function App() {

  const [nodes, setNodes] = useState<SimplifiedNodeData[]>([]);
  const [selectionIsEmpty, setselectionIsEmpty] = useState<boolean>(false);


  React.useEffect(() => {

    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;

      if (message.type === 'haveInstances') {
        setNodes(message.nodes);
        setselectionIsEmpty(false);

      } else if (message.type === 'noInstances') {
        setNodes([]);
        setselectionIsEmpty(true);

      }

      else { console.error('Received data is not in the expected format or type'); }
    };

    // Clean up the event listener when the component unmounts
    return () => {
      window.onmessage = null;
    };

  }, []);


  const renderSelectionIsEmpty = () => (
    <div>
      <div>No frames selected</div>
      <div>Please select a frame in the Figma document to annotate the OGP components within it</div>
    </div>
  );

  const renderValidInstances = () => (
    <Flex w='100%' gap='20px' flexDirection='column' py='16px'>

      <Text>
        OGP components have been annotated
      </Text>

      <Button
        size='lg'
        variant="outline"
        onClick={() => handleRemoveButtonClicked()}>
        Remove Annotations
      </Button>

    </Flex>

  );

  // Render logic
  let renderedContent;

  if (!selectionIsEmpty && nodes.length > 0) {
    renderedContent = renderValidInstances();
  } else if (selectionIsEmpty) {
    renderedContent = renderSelectionIsEmpty();
  } else {
    renderedContent = <p>Loading...</p>;
  }
  return (
    <Flex px="16px">{renderedContent}</Flex>
  );
}


export default App;