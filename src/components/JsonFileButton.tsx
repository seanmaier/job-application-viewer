import { useRef } from 'react';

interface Props {
  onLoad: (text: string) => void;
  className: string;
  label?: string;
}

// A button that opens a .json file picker and hands back the file's text,
// for pasting-or-uploading JSON inputs.
export function JsonFileButton({ onLoad, className, label = 'Load file' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    onLoad(await file.text());
  };

  return (
    <>
      <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleChange} />
      <button className={className} onClick={() => inputRef.current?.click()}>{label}</button>
    </>
  );
}
