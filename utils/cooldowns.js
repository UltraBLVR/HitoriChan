const cooldowns = new Map();

module.exports = {
  checkCooldown: (userId, commandName, cooldownTime = 3000) => {
    const key = `${userId}-${commandName}`;
    const now = Date.now();
    
    if (cooldowns.has(key)) {
      const expirationTime = cooldowns.get(key) + cooldownTime;
      if (now < expirationTime) {
        return Math.ceil((expirationTime - now) / 1000);
      }
    }
    
    cooldowns.set(key, now);
    return 0;
  },
  
  clearCooldown: (userId, commandName) => {
    const key = `${userId}-${commandName}`;
    cooldowns.delete(key);
  }
};