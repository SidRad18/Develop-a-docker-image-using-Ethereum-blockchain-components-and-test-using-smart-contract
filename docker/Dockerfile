# Step 1: Use official Node.js as base (needed for Ethereum tools like Truffle & Hardhat)
FROM node:18

# Step 2: Set working directory inside container
WORKDIR /usr/src/app

# Step 3: Install Truffle (Ethereum development framework)
RUN npm install -g truffle

# Step 4: Install Hardhat (another Ethereum framework)
RUN npm install -g hardhat

# Step 5: Default command (open bash for manual testing)
CMD [ "bash" ]
