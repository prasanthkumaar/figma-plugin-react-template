figma.showUI(__html__);
// import {getStoredNodeArray, removeAllPluginData, removeAnnotationsFromStoredNodes, saveNodeArrToDocumentPluginData, } from './plugin-data';

// Map that is used to store the valid instances. It is cleared everytime the user click on a new node
let listOfCurrentValidInstances = new Map<string, InstanceNode>();

// Switch for annotations
let annotationSwitch = true;

//Function to check plugin data
function checkPluginData() {
  console.log('Checking plugin data...');
  // console.log(getStoredNodeArray()); #TODO: PLUGIN_DATA
}


//Function to add the OGP annotation
function addOGPAnnotationToNode(node) {

  node.annotations = [{
    label:
      `<div>
    <div>（&nbsp;&nbsp;）OGP - ${node.name}</div>
    <br>
    <a href="${node.mainComponent.parent.documentationLinks[0].uri}">Documentation Link</a>
  </div>`}]
}


// Loop through the map and removes the current annotations that each node in the map has
function removeAnnotationsFromNodeList(listOfInstanceNodeMap: Map<string, InstanceNode>) {
  if (listOfInstanceNodeMap.size > 0) {
    listOfInstanceNodeMap.forEach((value) => {
      value.annotations = []
    });
  }
}


// Function to send a Map of instance node data to the UI
function sendInstanceNodesData(instanceNodesMap: Map<string, InstanceNode>): void {
  figma.ui.postMessage({ type: 'HAS_OGP_COMPONENTS', size: instanceNodesMap.size, selectedFrame: figma.currentPage.selection[0].name })
}

//Function to handle when a user selects on another node. It is run when plugin first loads
function handleSelectionChanged() {

  if (listOfCurrentValidInstances) {
    removeAnnotationsFromNodeList(listOfCurrentValidInstances);
    listOfCurrentValidInstances.clear();
    // removeAllPluginData()  #TODO: PLUGIN_DATA
  }


  const selectedNode = figma.currentPage.selection[0];

  if (selectedNode) {

    findAllValidInstances(selectedNode);
    if (listOfCurrentValidInstances) {
      sendInstanceNodesData(listOfCurrentValidInstances);
    }

    if (annotationSwitch) {

      const nodeArr: InstanceNode[] = []

      listOfCurrentValidInstances.forEach((value) => {

        addOGPAnnotationToNode(value);
        nodeArr.push(value)
      })
      // saveNodeArrToDocumentPluginData(nodeArr) #TODO: PLUGIN_DATA

    }
  } else {
    figma.ui.postMessage({ type: 'NOTHING_SELECTED' })

  }
}



//Function to recursively traverse through all the nodes to find the valid instance nodes
function findAllValidInstances(selectedNode: SceneNode) {
  if (isNodeValid(selectedNode) && selectedNode.type === 'INSTANCE') {
    listOfCurrentValidInstances.set(selectedNode.id, selectedNode);
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
    if (node.mainComponent.parent && node.mainComponent.parent.type === 'COMPONENT_SET') {
      let documentationLink = node.mainComponent.parent.documentationLinks[0];

      if (documentationLink) {
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
    removeAnnotationsFromNodeList(listOfCurrentValidInstances)
    // removeAnnotationsFromStoredNodes() #TODO: PLUGIN_DATA

  } else if (msg.type === 'plugin-data') {
    checkPluginData();

  } else if (msg.type === 'annotation-switch') {
    annotationSwitch = msg.value
    handleSelectionChanged()
  }
};

figma.on('selectionchange', () => {
  handleSelectionChanged();
});

figma.on("close", () => {
  removeAnnotationsFromNodeList(listOfCurrentValidInstances)
})

handleSelectionChanged();
