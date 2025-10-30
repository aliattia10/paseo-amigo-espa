// Sound effects utility

// Dog bark sound (woof woof!)
export const playDogSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playBark = (startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Dog bark is a quick low-to-high frequency sweep
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + startTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + startTime + 0.05);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + 0.1);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + 0.1);
    };
    
    // Two barks: "Woof woof!"
    playBark(0);
    playBark(0.15);
    
  } catch (error) {
    console.warn('Could not play dog sound:', error);
  }
};

// Cat meow sound
export const playCatSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Cat meow is a high-pitched warble
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.2);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
  } catch (error) {
    console.warn('Could not play cat sound:', error);
  }
};

// Generic match sound (for user-to-user matches)
export const playMatchSound = (petType?: 'dog' | 'cat') => {
  // Play pet-specific sound if pet type is provided
  if (petType === 'dog') {
    playDogSound();
    return;
  } else if (petType === 'cat') {
    playCatSound();
    return;
  }
  
  // Default celebration sound for user-to-user matches
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };
    
    // Play a happy chord progression (C major chord)
    playNote(523.25, 0, 0.3);    // C5
    playNote(659.25, 0, 0.3);    // E5
    playNote(783.99, 0, 0.3);    // G5
    
    // Add a second chord for celebration
    playNote(523.25, 0.15, 0.3); // C5
    playNote(659.25, 0.15, 0.3); // E5
    playNote(783.99, 0.15, 0.3); // G5
    playNote(1046.50, 0.15, 0.3); // C6
    
  } catch (error) {
    console.warn('Could not play match sound:', error);
  }
};

export const playNotificationSound = () => {
  try {
    // Create a gentle notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Two-tone notification
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

export const playLikeSound = () => {
  try {
    // Create a quick positive sound for likes
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    
  } catch (error) {
    console.warn('Could not play like sound:', error);
  }
};
