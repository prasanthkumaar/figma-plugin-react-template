declare module '*.svg' {
  const content: any;
  export default content;
}

// Define an interface for the simplified node data
interface SimplifiedNodeData {
  id: string;
  name: string;
  documentationLink: string | undefined;
}
