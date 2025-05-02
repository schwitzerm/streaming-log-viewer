import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

interface TerminalInputProps {
  onSubmit: (command: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const TerminalInput: React.FC<TerminalInputProps> = ({
  onSubmit,
  disabled = false,
  placeholder = "Type a command..."
}) => {
  const [command, setCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Optimize event handlers with useCallback
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!command.trim() || disabled) return;

    // Add command to history
    setCommandHistory(prev => [command, ...prev].slice(0, 50));

    try {
      // Call the submission handler
      onSubmit(command);
    } catch (error) {
      console.error('Error submitting command:', error);
    }

    // Clear the input
    setCommand('');
    setHistoryIndex(-1);
  }, [command, disabled, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrows for command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      setHistoryIndex(newIndex);
      if (newIndex >= 0 && newIndex < commandHistory.length) {
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      if (newIndex >= 0) {
        setCommand(commandHistory[newIndex]);
      } else {
        setCommand('');
      }
    } else if (e.key === 'Escape') {
      setCommand('');
      setHistoryIndex(-1);
    }
  }, [historyIndex, commandHistory]);

  return (
    <InputContainer>
      <InputForm onSubmit={handleSubmit} role="search" aria-label="Command input">
        <InputPrompt aria-hidden="true">$</InputPrompt>
        <Input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          aria-label="Command input"
          aria-disabled={disabled}
          aria-describedby={disabled ? "disabled-message" : undefined}
        />
        <SubmitButton
          type="submit"
          disabled={disabled || !command.trim()}
          aria-label="Send command"
        >
          Send
        </SubmitButton>
      </InputForm>
      {disabled && (
        <DisabledMessage id="disabled-message" role="alert">
          Select a client from the dropdown to send commands
        </DisabledMessage>
      )}
    </InputContainer>
  );
};


const InputContainer = styled.div`
  position: relative;
`;

const InputForm = styled.form`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.background};
  border-top: 1px solid ${({ theme }) => theme.border};
  border-radius: 0px;
  padding: 6px 10px;
  margin-top: 8px;
`;

const InputPrompt = styled.span`
  color: ${({ theme }) => theme.green};
  margin-right: 8px;
  font-weight: bold;
  font-family: 'Fira Code', monospace;
`;

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text};
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  outline: none;
  padding: 0;
  /* This sets the caret color and applies the blinking animation only to the caret */
  caret-color: ${({ theme }) => theme.caretColor};

  &::placeholder {
    color: ${({ theme }) => theme.infoText};
    opacity: 0.6;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Focus styles for the input */
  &:focus {
    border: none;
    outline: none;
    box-shadow: none;
    caret-color: ${({ theme }) => theme.primary};
  }
`;


const SubmitButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.background};
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  margin-left: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.blue};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.secondary};
  }
`;

const DisabledMessage = styled.div`
  color: ${({ theme }) => theme.infoText};
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
  font-style: italic;
`;

export default TerminalInput;
