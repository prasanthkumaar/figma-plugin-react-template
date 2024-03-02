import { Flex } from '@chakra-ui/react';
import { Infobox, Toggle } from '@opengovsg/design-system-react';
import React, { useState } from 'react';
// import { BiBrushAlt } from 'react-icons/bi';


// function handleRemoveButtonClicked(): void {
//   parent.postMessage({ pluginMessage: { type: 'remove-annotations' } }, '*');
// }

// function checkPluginData(): void {
//   parent.postMessage({ pluginMessage: { type: 'plugin-data' } }, '*');
// }

function handleSwitchIsOn(switchValue: boolean): void {
  parent.postMessage({ pluginMessage: { type: 'annotation-switch', value: switchValue } }, '*');

}



function App() {

  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [noOfComponents, setNoOfComponents] = useState<number>(0);
  const [selectedFrame, setselectedFrame] = useState<string>('');
  const [isSeletionEmpty, setSelectionEmpty] = useState<boolean>(true)


  // Step 2: Define the onChange handler
  const handleToggleChange = (event) => {

    const isSwitchChecked = event.target.checked;

    // Update the state with the new value
    setIsChecked(isSwitchChecked);

    // Post message to controller of the switch value
    handleSwitchIsOn(isSwitchChecked);
  };



  React.useEffect(() => {

    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;

      if (message.type === 'HAS_OGP_COMPONENTS') {

        setSelectionEmpty(false)
        setselectedFrame(message.selectedFrame)
        setNoOfComponents(message.size)

        //console.log('UI: recieving frame name: ', message.selectedFrame)
        //console.log('UI: recieving no. of components: ', message.size)

      } else if (message.type === 'NOTHING_SELECTED') {

        //console.log('UI: nothing selected')
        setSelectionEmpty(true)

      }

      else { console.error('Received data is not in the expected format or type'); }
    };

    // Clean up the event listener when the component unmounts
    return () => {
      window.onmessage = null;
    };

  }, []);




  const getInfoboxContent = () => {
    if (isSeletionEmpty) {
      return 'Nothing selected. Please select a frame to check if there are OGP components.';
    }
  
    if (noOfComponents == 1) {
      return `There is ${noOfComponents} OGP component on Frame: '${selectedFrame}'`;
    } else if (noOfComponents > 1) {
      return `There are ${noOfComponents} OGP components on Frame: '${selectedFrame}'`;
    }
  
    return `There are no OGP components on Frame: '${selectedFrame}'`;
  };


  return (
    <Flex flexDirection="column" gap="8px" justifyContent="space-between" height="100%">

      <Flex borderWidth='1px 0' p="1rem" flexDirection="column" gap='1rem'>
        <Toggle
          labelStyles={{
            // TO-FIX: Fix the syntax for overriding the textStyle
            textStyle: "subhead-2",
            fontSize: "0.875rem",
            marginBottom: "0"
          }}
          containerStyles={{
            w: '100%'
          }}
          size="sm"
          m='0'
          label="Annotate OGP Components"
          isChecked={isChecked}
          onChange={handleToggleChange}>
        </Toggle>

        <Infobox 
        variant={noOfComponents>0 && !isSeletionEmpty ? 'success' : 'info'}
        size="sm">
          {getInfoboxContent()}
        </Infobox>


      </Flex>

      {/* #TODO: PLUGIN_DATA */}
      {/* <Flex p="1rem" flexDirection='column' gap='16px'>
        <Flex w="100%" justifyContent="space-between">
          <FormLabel
            w="200px"
            size="sm"
            // TO-FIX: Fix the syntax for overriding the style
            // description="Delete any annotations made by this plugin that have not been previously removed."
            isRequired
          >
            Remove annotations
            <FormLabel.Description
            // TO-FIX: Fix the syntax for overriding the style. Should I be using FormLabel.Description
              textStyle="caption-2"
              fontSize="0.755rem"
              color='red'>
              Delete any annotations made by this plugin that have not been previously removed.
            </FormLabel.Description>
          </FormLabel>

          <IconButton
            aria-label="Remove annotations"
            colorScheme="neutral"
            icon={<BiBrushAlt />}
            size="sm"
            variant="clear"
            onClick={() => handleRemoveButtonClicked()}

          />
        </Flex>

        <Button
          size='lg'
          variant="outline"
          width="100%"
          onClick={() => checkPluginData()}>
          Check Plugin Data
        </Button>
      </Flex> */}


      
    </Flex>
  );
}


export default App;