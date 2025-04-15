interface PlaceHolderProps {
  content: string;
}

export function PlaceHolder({ content }: PlaceHolderProps) {
  return (
    <div>
      <h3>Generic Item Component</h3>
      <p>Place holder of Item content component: the following is detail content from items:</p>
      <p>{content}</p>
    </div>
  )
} 