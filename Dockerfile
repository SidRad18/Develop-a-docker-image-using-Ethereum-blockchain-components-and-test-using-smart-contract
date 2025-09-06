# Step 1: Start with Node.js 22
FROM node:22

# Step 2: Set working directory
WORKDIR /usr/src/app

# Step 3: Copy your project files into the container
COPY . .

# Step 4: Install global Ethereum tools
RUN npm install -g truffle hardhat

# Step 5: Install project dependencies
RUN npm install

# Step 6: Default command when container starts
CMD ["bash"]
