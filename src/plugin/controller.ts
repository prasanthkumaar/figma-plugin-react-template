const PLUGIN_NAMESPACE = ''
figma.showUI(__html__);

// Map that is used to store the valid instances. It is cleared everytime the user click on a new node
let validInstanceNodeMap = new Map<string, InstanceNode>();


//Function to add the valid instances into the shared plugin data. Allows clean up of annotations for the whole document if needed
function addInstancesToDocumentNode() {
  //figma.root.setPluginData('')
}

//Function to remove any annotations store on the document created by the plugin
function removeAnnotationsFromDocumentNode() {

}

//Function to add the OGP annotation
function addOGPAnnotationToNode(node) {
  node.annotations = [{ label: `<div>
    <div>（&nbsp;&nbsp;）OGP - ${node.name}</div>
    <br>
    <a href="${node.mainComponent.parent.documentationLinks[0].uri}">Documentation Link</a>
  </div>`}]
}

function removeAnnotationsFromNodeList() {
    // Loop through the map and run the function on each value
    if (validInstanceNodeMap.size > 0) {
      validInstanceNodeMap.forEach((value) => {
        console.log(value.id)
        value.annotations = []
      });
    }

    }


// Function to send a Map of instance node data to the UI
function sendInstanceNodesData(instanceNodesMap: Map<string, InstanceNode>): void {
  // Convert the Map values into an array of simplified objects
  const nodesData = Array.from(instanceNodesMap.values()).map((node) => {
    const parent = node.mainComponent.parent;
    if (parent.type === 'COMPONENT_SET') {
      return { id: node.id, name: node.name, documentationLink: parent.documentationLinks[0].uri };
    }
    return { id: node.id, name: node.name };
  });

  figma.ui.postMessage({ type: 'haveInstances', nodes: nodesData });
}

//Function to handle when a user selects on another node. It is run when plugin first loads
function handleSelectionChanged() {

  removeAnnotationsFromNodeList();

  const selectedNode = figma.currentPage.selection[0];
  validInstanceNodeMap.clear();

  if (selectedNode) {
    findAllValidInstances(selectedNode);
  } else {
    console.log('No frames selected');
    figma.ui.postMessage({
      type: 'noInstances',
      message: 'No valid instances selected. Please select one or more instances.',
    });
  }

  if (validInstanceNodeMap.size > 0) {
    console.log(`controller Found ${validInstanceNodeMap.size} instances:\n`);
    sendInstanceNodesData(validInstanceNodeMap);
  } else {
    console.warn('No valid instances in the frame selected');
  }
}

//Function to recursively traverse through all the nodes to find the valid instance nodes
function findAllValidInstances(selectedNode: SceneNode) {
  if (isNodeValid(selectedNode) && selectedNode.type === 'INSTANCE') {
    validInstanceNodeMap.set(selectedNode.id, selectedNode);
    return;
  }

  // Check if the node can have children before accessing the 'children' property and traverse through its children
  if ('children' in selectedNode && Array.isArray(selectedNode['children'])) {
    for (const child of selectedNode['children']) {
      findAllValidInstances(child);
    }
  }
}

//Function that determines if a node is valid
//Conditions: 
// - InstanceNode
// - Must have a documentationLink
function isNodeValid(node): boolean {

  if (node.type === 'INSTANCE') {
    // Check if it has a developer resource link
    //const link = await node.getDevResourcesAsync();

    if (node.mainComponent.parent && node.mainComponent.parent.type === 'COMPONENT_SET') {

      let documentationLink = node.mainComponent.parent.documentationLinks[0];

      if (documentationLink) {
        //console.log(documentationLink)
        addOGPAnnotationToNode(node);

        
        
        return true;
      } else {
        return false;
      }
    }


  } else {
    return false;
  }
}

figma.ui.onmessage = (msg) => {

  if (msg.type === 'remove-annotations') {
    removeAnnotationsFromNodeList()
  }
};

figma.on('selectionchange', () => {
  handleSelectionChanged();
});

handleSelectionChanged();
