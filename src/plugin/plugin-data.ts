const PLUGIN_DATA_KEY = "SAVED_NODE_PATH_ARRAY"
const PLUGIN_NAMESPACE = "OGP_FINDER"

//Function to clear the plugin data
export function removeAllPluginData() {
    figma.root.setSharedPluginData(PLUGIN_NAMESPACE, PLUGIN_DATA_KEY, '');
}


//Function to construct absolute path to a give node
export function constructAbsolutePath(node: SceneNode): string {
    let path: string[] = [];
    let currentNode: BaseNode | null = node;

    while (currentNode && currentNode.type !== 'DOCUMENT') {
        path.unshift(currentNode.id); // Add the current node ID to the start of the path array
        currentNode = currentNode.parent; // Move up to the parent node
    }
    return path.join('/'); // Join the array into a string path
}

//Function to get node from a string path
export function findNodeByPath(path: string): SceneNode | null {
    const ids: string[] = path.split('/'); // Split the path into an array of IDs
    let currentNode: BaseNode = figma.root; // Start from the root node

    for (let id of ids) {
        // Use findOne to search for the node by ID within the current node's children
        const nextNode: SceneNode | null = (currentNode as ChildrenMixin).findOne((node: SceneNode) => node.id === id) as SceneNode;

        if (!nextNode) {
            console.error('Node not found for ID:', id);
            return null; // Return null if any ID in the path does not correspond to a valid node
        }

        currentNode = nextNode;
    }

    return currentNode as SceneNode;
}

//Function to test construction of absolute path and finding the node based on the absolute path
export function test_findNodeByPath(node: SceneNode) {
    console.log('Starting node:', node)
    const path: string = constructAbsolutePath(node);
    console.log('Path:', path);

    const nodeReference: SceneNode | null = findNodeByPath(path);
    if (nodeReference) {
        console.log('Node found:', nodeReference);
    } else {
        console.log('Node not found');
    }
}

//Optimised function to save whole array to plugin straight away, by pulling getting plugin data once for whole array
export function saveNodeArrToDocumentPluginData(nodeArr: InstanceNode[]) {

    // Attempt to get the stored array of paths from plugin data
    const storedArrayOfPaths: string[] = getStringArrayFromPluginData() || [];

    // Iterate over nodes and clear annotations if node is of type INSTANCE
    nodeArr.forEach(node => {
        storedArrayOfPaths.push(constructAbsolutePath(node))
    });

    figma.root.setSharedPluginData(PLUGIN_NAMESPACE, PLUGIN_DATA_KEY, JSON.stringify(storedArrayOfPaths))


}

//Function to save last selected node as an absolute path within an array into the document plugin data
export function saveSingleNodeToDocumentPluginData(node: SceneNode): void {

    // Initialize an empty array to store paths
    let arrayOfPaths: string[] = [];

    // Create a new path using the constructAbsolutePath function
    const newPath: string = constructAbsolutePath(node);

    // Attempt to get the stored array of paths from plugin data
    const storedArrayOfPaths: string[] = getStringArrayFromPluginData() || [];

    // Add the new path to the existing paths (if any) or start a new array if none exist
    arrayOfPaths = [...storedArrayOfPaths, newPath];

    console.log('Saving this string into the figma document: ', arrayOfPaths)

    figma.root.setSharedPluginData(PLUGIN_NAMESPACE, PLUGIN_DATA_KEY, JSON.stringify(arrayOfPaths))
}

//Function to get string array from plugin data
export function getStringArrayFromPluginData(): string[] {

    let stringArr: string[] = []

    //get document's plugin data (if any)
    const pluginDataString = figma.root.getSharedPluginData(PLUGIN_NAMESPACE, PLUGIN_DATA_KEY)

    console.log('Got this string from the figma document: ', pluginDataString)

    if (pluginDataString != '') {
        try {
            stringArr = JSON.parse(pluginDataString);

        } catch (error) {
            console.error("Couldn't parse string to array");
            console.error(error);
            // Expected output: ReferenceError: nonExistentFunction is not defined
            // (Note: the exact output may be browser-dependent)
        }

    }

    return stringArr


}

//Function to get an array of the nodes stored in plugin data
//Calls the above function to get plugin data
export function getStoredNodeArray(): SceneNode[] {

    // Attempt to get the stored array of paths from plugin data
    const storedArrayOfPaths: string[] = getStringArrayFromPluginData() || [];
    let arrayOfStoredNodes: SceneNode[] = []

    storedArrayOfPaths?.forEach((path) => {

        console.log('Reading from array', path)

        const nodeFound = findNodeByPath(path);
        if (nodeFound && nodeFound.type == "INSTANCE") {
            arrayOfStoredNodes.push(nodeFound)
        }
    });

    return arrayOfStoredNodes;

}

//Function to remove annotations from saved nodes in the stored plugin data 
export function removeAnnotationsFromStoredNodes() {

    const nodeArray = getStoredNodeArray()

    // Log error if nodeArray is null or undefined
    if (!nodeArray) {
        console.error('Error in trying to get stored nodes');
    } else {

        // Iterate over nodes and clear annotations if node is of type INSTANCE
        nodeArray?.forEach(node => {
            if (node.type === "INSTANCE") {
                node.annotations = [];
            }
        });
        console.log('Annotations should be removed')


    }

    // Reset plugin data
    figma.root.setSharedPluginData(PLUGIN_NAMESPACE, PLUGIN_DATA_KEY, '');
}
