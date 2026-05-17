import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Initial Virtual File System (VFS) ---
const INITIAL_VFS: Record<string, string | { type: 'dir' }> = {
  'about_me.md': `## Julian
Software & Robotics Engineer from Bekasi.
JUst a self-taught low level developer and Robotic engineer.
Currently diving deep into Linux systems and embedded programming.`,
  
  'projects.txt': `1. CLUEBREAKER V1.0 : A Robot my team built for First Tech Challenge 2026, We won.
2. RL-ARM: 4-DOF Reinforcement Learning robotic arm.
3. NUSA. (Nutrient Saver): An AI Based system that receive ur picture and shows the nutrition facts.
4. LINUX-DASHBOARD: Custom system monitor for Debian servers.`,
  
  'skills.json': `{
  "languages": ["TypeScript", "C/C++", "Python", "Rust"],
  "tools": ["Git", "Docker", "Arduino", "ESP-IDF", "Gerrit"],
  "os": ["Debian", "Arch Linux", "Ubuntu"],
  "frameworks": ["React", "Express", "Node.js", "ROS2"]
}`,
};

const DEBIAN_LOGO = `
                  .o+
                 \`ooo/
                \`+oooo:
               \`+oooooo:
               -+oooooo+:
             \`/:-:++oooo+:
            \`/++++/+++++++:
           \`/++++++++++++++:
          \`/+++ooooooooooooo/\`
         ./ooosssso++osssssso+
        .oossssso-\`\`\`\`/ossssss+
       -osssssso.      :ssssssso.
      :osssssss/        osssso+++.
     /ossssssss/        +ssssooo/-
   \`/ossssso+/:-        -:/+osssso+-
  \`+sso+:-\`                 \`.-/+oso:
 \`++:.                           \`-/+/
 .\`           ;
`;

type LogEntry = {
  type: 'command' | 'output' | 'raw' | 'fastfetch';
  content?: string;
  dir?: string;
};

export default function Terminal() {
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState('~');
  const [vfs, setVfs] = useState(INITIAL_VFS);
  const [history, setHistory] = useState<LogEntry[]>([
    { type: 'fastfetch' }
  ]);
  
  // Nano Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editingFile, setEditingFile] = useState('');
  const [editContent, setEditContent] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nanoRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isEditing) {
        nanoRef.current?.focus();
    } else {
        inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleTerminalClick = () => {
    if (!isEditing) inputRef.current?.focus();
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newEntries: LogEntry[] = [
      { type: 'command', content: trimmedCmd, dir: currentDir }
    ];

    switch (command) {
      case 'clear':
        setHistory([]);
        return;
      
      case 'help':
        newEntries.push({
          type: 'output',
          content: `Standard helpful tips:
- ls [-l]: List filenames (use -l for long format).
- mkdir [name]: Create a new directory.
- nano [file]: Edit or create a text file.
- cat [filename]: Display the contents of a file.
- portfolio: View Julian's engineering portfolio & skills.
- social: Show my social media links.
- echo [text]: Print text to the terminal.
- cd [dir]: Change the current directory.
- date: Display the current date and time.
- clear: Clear the terminal screen.
- help: Show this help message.`
        });
        break;

      case 'portfolio':
        newEntries.push({
          type: 'output',
          content: `
📂 Julian's Engineering Portfolio
=================================
Software & Robotics Engineer from Bekasi.
Self-taught low level developer and Robotic engineer.

🚀 TOP PROJECTS:
----------------
- CLUEBREAKER V1.0: First Tech Challenge 2026 Robot.
- RL-ARM: 4-DOF Reinforcement Learning robotic arm.
- NUSA: AI Based nutrition fact system.
- LINUX-DASHBOARD: Custom system monitor.

🛠️ TECH STACK:
--------------
- Languages: TypeScript, C, Python, C++, Rust
- Frameworks: React, Express, ROS2
- OS: Debian, Arch Linux, RTOS

🌐 SOCIALS:
-----------
- Discord: @flux0x21
- Instagram: @avrjulian.ino
- GitHub: @whysixmift
- Email: miftasigma11@gmail.com

Type 'cat about_me.md', 'cat projects.txt' or 'cat skills.json' for more details.`
        });
        break;

      case 'social':
        newEntries.push({
          type: 'output',
          content: `
🌐 SOCIALS:
-----------
- Discord: @flux0x21
- Instagram: @avrjulian.ino
- GitHub: @whysixmift
- Email: miftasigma11@gmail.com`
        });
        break;

      case 'mkdir':
        if (args.length === 0) {
            newEntries.push({ type: 'output', content: 'mkdir: missing operand' });
        } else {
            const dirName = args[0];
            setVfs(prev => ({ ...prev, [dirName]: { type: 'dir' } }));
            newEntries.push({ type: 'output', content: `Created directory: ${dirName}` });
        }
        break;

      case 'nano':
        if (args.length === 0) {
            newEntries.push({ type: 'output', content: 'nano: missing filename' });
        } else {
            const filename = args[0];
            const fileData = vfs[filename];
            if (fileData && typeof fileData !== 'string') {
                newEntries.push({ type: 'output', content: `nano: ${filename} is a directory` });
            } else {
                setEditingFile(filename);
                setEditContent(fileData as string || '');
                setIsEditing(true);
                return; // Don't add to history yet
            }
        }
        break;

      case 'date':
        newEntries.push({
          type: 'output',
          content: new Date().toString()
        });
        break;

      case 'echo':
        newEntries.push({
          type: 'output',
          content: args.join(' ')
        });
        break;

      case 'cd':
        if (args.length === 0 || args[0] === '~' || args[0] === 'home') {
          setCurrentDir('~');
        } else {
          const newDir = args[0];
          if (vfs[newDir] && typeof vfs[newDir] !== 'string') {
              setCurrentDir(prev => prev === '~' ? `~/${newDir}` : `${prev}/${newDir}`);
          } else if (newDir === '..') {
              setCurrentDir('~');
          } else {
              newEntries.push({ type: 'output', content: `cd: ${newDir}: No such directory` });
          }
        }
        break;

      case 'ls':
        const isLongFormat = args.includes('-l');
        const files = Object.keys(vfs);
        if (isLongFormat) {
          const longOutput = files.map(file => {
            const data = vfs[file];
            const isDir = typeof data !== 'string';
            const size = isDir ? 4096 : (data as string).length;
            const typeChar = isDir ? 'd' : '-';
            const sizeStr = size.toString().padStart(5);
            return `${typeChar}rw-r--r-- 1 julian julian ${sizeStr} May 16 08:00 ${file}`;
          }).join('\n');
          newEntries.push({
            type: 'output',
            content: `total ${files.length * 4}\n${longOutput}`
          });
        } else {
          newEntries.push({
            type: 'output',
            content: files.join('  ')
          });
        }
        break;

      case 'cat':
        if (args.length === 0) {
          newEntries.push({ type: 'output', content: 'usage: cat [filename]' });
        } else {
          const filename = args[0];
          const fileContent = vfs[filename];
          if (fileContent && typeof fileContent === 'string') {
            newEntries.push({ type: 'output', content: fileContent });
          } else if (fileContent) {
             newEntries.push({ type: 'output', content: `cat: ${filename}: Is a directory` });
          } else {
            newEntries.push({ type: 'output', content: `cat: ${filename}: No such file or directory` });
          }
        }
        break;

      default:
        newEntries.push({ type: 'output', content: `bash: ${command}: command not found` });
    }

    setHistory(prev => [...prev, ...newEntries]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    }
  };

  const handleNanoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setVfs(prev => ({ ...prev, [editingFile]: editContent }));
        setHistory(prev => [...prev, { type: 'command', content: `nano ${editingFile}`, dir: currentDir }, { type: 'output', content: `Saved ${editingFile}` }]);
    }
    if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        setIsEditing(false);
        setEditingFile('');
        setEditContent('');
    }
  };

  if (isEditing) {
    return (
        <div className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] font-mono flex flex-col p-0">
            <div className="bg-[#cdd6f4] text-[#1e1e2e] px-2 py-1 text-sm flex justify-between">
                <span>GNU nano 7.2</span>
                <span className="font-bold underline">{editingFile}</span>
                <span>Modified</span>
            </div>
            <textarea
                ref={nanoRef}
                className="flex-1 bg-transparent border-none outline-none p-4 resize-none text-[#cdd6f4] caret-white"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleNanoKeyDown}
                spellCheck={false}
            />
            <div className="bg-[#181825] p-2 text-xs flex gap-6 text-[#9399b2]">
                <div><span className="bg-[#313244] px-1 text-white">^X</span> Exit</div>
                <div><span className="bg-[#313244] px-1 text-white">^S</span> Save</div>
            </div>
        </div>
    );
  }

  return (
    <div 
      id="terminal-container"
      className="min-h-screen bg-[#1e1e2e] text-[#cdd6f4] font-mono p-4 md:p-8 flex flex-col cursor-text"
      onClick={handleTerminalClick}
    >
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full scrollbar-hide"
      >
        <div className="space-y-1 mb-8">
          <AnimatePresence mode="popLayout">
            {history.map((entry, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
                className="whitespace-pre-wrap break-words"
              >
                {entry.type === 'command' ? (
                  <div className="flex gap-2 text-xs md:text-sm">
                    <span className="text-[#b4befe]">julian@arch</span>
                    <span className="text-zinc-500">:</span>
                    <span className="text-zinc-400">{entry.dir || '~'}</span>
                    <span className="text-[#f38ba8]">$</span>
                    <span className="text-[#cdd6f4]">{entry.content}</span>
                  </div>
                ) : entry.type === 'fastfetch' ? (
                  <div className="flex flex-col md:flex-row gap-4 items-start text-xs md:text-sm my-4">
                    <div className="text-[#89b4fa] whitespace-pre font-bold leading-tight align-top select-none shrink-0" style={{ marginTop: '-1rem' }}>
                      {DEBIAN_LOGO}
                    </div>
                    <div className="flex flex-col text-[#cdd6f4] leading-tight shrink-0">
                       <div className="font-bold">
                         <span className="text-[#b4befe]">julian</span>@<span className="text-[#b4befe]">arch</span>
                       </div>
                       <div className="text-zinc-500">-------------</div>
                       <div><strong className="text-[#74c7ec]">OS</strong>: Arch Linux x86_64</div>
                       <div><strong className="text-[#74c7ec]">Host</strong>: Virtual Machine Hyper-V UEFI Release v4.0</div>
                       <div><strong className="text-[#74c7ec]">Kernel</strong>: Linux 6.19.14-arch1-1</div>
                       <div><strong className="text-[#74c7ec]">Uptime</strong>: 67 hours</div>
                       <div><strong className="text-[#74c7ec]">Terminal</strong>: bash</div>
                       <div><strong className="text-[#74c7ec]">CPU</strong>: AMD Ryzen Threadripper PRO 7995WX 96-Cores (192) @ 5.14 GHz</div>
                       <div><strong className="text-[#74c7ec]">Memory</strong>: 205.4 MiB / 1.94 TiB</div>
                       <div><strong className="text-[#74c7ec]">Swap</strong>: 100.3 MiB / 1.96 TiB</div>
                       <div><strong className="text-[#74c7ec]">Disk</strong>: 31.8 GiB / 24 TiB (0%)</div>
                       <br />
                       <div className="whitespace-normal max-w-lg mb-1"><strong className="text-[#f9e2af]">Fun fact!</strong> I can spend hours wiring microcontrollers. 🛠️🐈</div>
                       <div className="whitespace-normal max-w-lg"><strong className="text-[#a6e3a1]">Need help?</strong> Type 'help' or 'portfolio' to get started!</div>
                    </div>
                  </div>
                ) : (
                  <div className={`text-xs md:text-sm ${entry.type === 'output' ? 'text-[#bac2de]' : 'text-[#f5c2e7]'}`}>
                    {entry.content}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2 items-center text-xs md:text-sm mt-2">
          <div className="flex gap-2 shrink-0">
            <span className="text-[#b4befe]">julian@arch</span>
            <span className="text-zinc-500">:</span>
            <span className="text-zinc-400">{currentDir}</span>
            <span className="text-[#f38ba8]">$</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[#cdd6f4] font-mono p-0 focus:ring-0 text-xs md:text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            id="terminal-input"
          />
        </div>
      </div>
    </div>
  );
}
