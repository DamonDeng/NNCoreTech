export type ContentComponentType = 'Neuron' | 'PlaceHolder';

export interface Item {
  id: string;
  title: string;
  content: string;
  contentComponent: ContentComponentType;
} 