import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Virtual File System (VFS) Definition ---
const VFS = {
  'about_me.md': `## Julian
Software & Robotics Engineer from SMKN 2 Bekasi.
A passionate engineer who loves bridging the gap between software and hardware.
Currently diving deep into Linux systems and embedded programming.`,
  
  'projects.txt': `1. JFY-SH: A realistic terminal emulator built with React.
2. ROBOT-ARM: 4-DOF Arduino-controlled robotic arm.
3. SMART-PLANT: IoT-based plant monitoring system with ESP32.
4. LINUX-DASHBOARD: Custom system monitor for Debian servers.`,
  
  'skills.json': `{
  "languages": ["TypeScript", "C/C++", "Python", "Rust"],
  "tools": ["Git", "Docker", "Arduino", "ESP-IDF", "Gerrit"],
  "os": ["Debian", "Arch Linux", "Ubuntu"],
  "frameworks": ["React", "Express", "Node.js", "ROS2"]
}`,
};

const FASTFETCH_TEXT = `julian@jfy.sh
OS: Debian GNU/Linux 12.5 (bookworm) x86_64
Host: Virtual Machine Hyper-V UEFI Release v4.0
Kernel: 6.1.0-21-amd64
Uptime: 4 mins
Resolution: 1920x1080
DE: GNOME 43.9 (wayland)
VIM: Mutter
WPI Theme: Adwaita
Theme: Adwaita [GTK2/3]
Terminal: gnome-terminal
CPU: Intel i5-10210U (1) @ 2.111GHz
Fun fact! I can spend hours wiring microcontrollers and tweaking Arch Linux configs. 🛠️🐈
Need help? Type 'help' to get started!`;

type LogEntry = {
  type: 'command' | 'output' | 'raw';
  content: string;
  dir?: string;
};

export default function Terminal() {
  const [input, setInput] = useState('');
  const [currentDir, setCurrentDir] = useState('~');
  const [history, setHistory] = useState<LogEntry[]>([
    { type: 'raw', content: FASTFETCH_TEXT }
  ]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
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
- cat [filename]: Display the contents of a file.
- echo [text]: Print text to the terminal.
- cd [dir]: Change the current directory.
- date: Display the current date and time.
- admin: Access the administrative dashboard.
- clear: Clear the terminal screen.
- help: Show this help message.`
        });
        break;

      case 'admin':
        newEntries.push({
          type: 'output',
          content: 'Redirecting to Admin Panel...'
        });
        setTimeout(() => {
           window.location.href = '/admin';
        }, 1000);
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
          if (newDir === 'projects' || newDir === '/projects') {
              setCurrentDir('~/projects');
          } else if (newDir === '..') {
              setCurrentDir('~');
          } else {
              setCurrentDir(newDir.startsWith('/') ? newDir : `${currentDir}/${newDir}`.replace(/\/+/g, '/'));
          }
        }
        break;

      case 'ls':
        const isLongFormat = args.includes('-l');
        if (isLongFormat) {
          const longOutput = Object.keys(VFS).map(file => {
            const size = VFS[file as keyof typeof VFS].length;
            const sizeStr = size.toString().padStart(5);
            return `-rw-r--r-- 1 julian julian ${sizeStr} May 16 08:00 ${file}`;
          }).join('\n');
          newEntries.push({
            type: 'output',
            content: `total ${Object.keys(VFS).length * 4}\n${longOutput}`
          });
        } else {
          newEntries.push({
            type: 'output',
            content: Object.keys(VFS).join('  ')
          });
        }
        break;

      case 'cat':
        if (args.length === 0) {
          newEntries.push({ type: 'output', content: 'usage: cat [filename]' });
        } else {
          const filename = args[0];
          if (VFS[filename as keyof typeof VFS]) {
            newEntries.push({ type: 'output', content: VFS[filename as keyof typeof VFS] });
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

  return (
    <div 
      id="terminal-container"
      className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-mono p-4 md:p-8 flex flex-col cursor-text"
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
                  <div className="flex gap-2">
                    <span className="text-[#a1a1aa]">julian@jfy.sh</span>
                    <span className="text-zinc-500">:</span>
                    <span className="text-zinc-400">{entry.dir || '~'}</span>
                    <span className="text-zinc-500">$</span>
                    <span>{entry.content}</span>
                  </div>
                ) : (
                  <div className={entry.type === 'output' ? 'text-zinc-300' : ''}>
                    {entry.content}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-2 shrink-0">
            <span className="text-[#a1a1aa]">julian@jfy.sh</span>
            <span className="text-zinc-500">:</span>
            <span className="text-zinc-400">{currentDir}</span>
            <span className="text-zinc-500">$</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-[#f4f4f5] font-mono p-0 focus:ring-0"
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
