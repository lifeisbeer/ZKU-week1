#!/bin/bash

# [assignment] create your own bash script to compile Multiplier3.circom modeling after compile-HelloWorld.sh below

cd contracts/circuits

mkdir Multiplier3

# Get the ptau file (ptau files contain a history of all the challenges and responses that have taken place so far - all the contributions so far).
if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3.circom..."

# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3 # Compile the circuit, r1cs: generate the constraint system, wasm: generate the witness, sym: generate the symbols file (useful for debugging)

snarkjs r1cs info Multiplier3/Multiplier3.r1cs # View information about the circuit

# Start a new zkey and make a contribution

snarkjs groth16 setup Multiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3/circuit_0000.zkey # Setup: Generates the reference zkey without any contributions for phase 2,  powersOfTau28_hez_final_10.ptau: transcript of the protocol (contributions) so far [this is from phase 1], Multiplier3/circuit_0000.zkey: reference zkey for phase 2 without any contributions 

snarkjs zkey contribute Multiplier3/circuit_0000.zkey Multiplier3/circuit_final.zkey --name="1st Contributor Name" -v -e="random text" # Contribute to the phase 2 ceremony, Multiplier3/circuit_0000.zkey: transcript of the protocol so far, Multiplier3/circuit_final.zkey: new transcript of the protocol with the computation, name: can be anything, e: random text to provide a source of entropy (I think this is the "toxic waste")

snarkjs zkey export verificationkey Multiplier3/circuit_final.zkey Multiplier3/verification_key.json # Export the verification key from zkey, Multiplier3/circuit_final.zkey: transcript of the protocol so far, Multiplier3/verification_key.json: verification key

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3/circuit_final.zkey ../Multiplier3.sol # Generate a solidity smart contract verifier for this circuit, Multiplier3/circuit_final.zkey: transcript of the protocol so far, ../Multiplier3.sol: solidity smart contract that verifies the zero knowledge proof

cd ../..