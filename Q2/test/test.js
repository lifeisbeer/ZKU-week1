const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16, plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () { // The test suit for HelloWorld
    this.timeout(100000000); // Set a timeout for the tests 
    let Verifier; // Declare the contract factory 
    let verifier; // Declare the deployed contract instance

    beforeEach(async function () { // This will run before each test
        Verifier = await ethers.getContractFactory("HelloWorldVerifier"); // Get the contract 
        verifier = await Verifier.deploy(); // Deploy the contract
        await verifier.deployed(); // Wait for the contract to be deployed
    });

    it("Circuit should multiply two numbers correctly", async function () { // First test is about circom 
        const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom"); // Get the circuit

        const INPUT = { // Create the input
            "a": 2,
            "b": 3
        }

        const witness = await circuit.calculateWitness(INPUT, true); // Calculate the witness using the input

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1))); // Check that the first part is 1 (should always be 1)
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(6))); // Check that the second part is 6 (should be 2*3 as the circuit multiplies two numbers, 2 and 3 in this case)

    });

    it("Should return true for correct proof", async function () { // Second test is about the proof/verifier smart contract
        //[assignment] Add comments to explain what each line is doing
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey"); // Get the proof and public signals of the circuit using the provided inputs, wasm and zkey

        console.log('2x3 =',publicSignals[0]); // Print the task and the answer (public signal) the circuit gives back
        
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals); // Get the input to the smart contract from the proof and public signals
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // The calldata is a string (that contains lists of hexadecimal numbers), so we need to convert it to an array of BigInts strings
    
        const a = [argv[0], argv[1]]; // Get a from the first two elements of the array
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // Get b from the next four elements of the array
        const c = [argv[6], argv[7]]; // Get c from the next two elements of the array
        const Input = argv.slice(8); // Get the input from the rest (last element) of the array

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // Check if the proof is correct
    });
    it("Should return false for invalid proof", async function () { // Third test is again about the proof/verifier smart contract but with an invalid proof
        // Create invalid parameters for the proof
        let a = [0, 0]; 
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false; // Make sure the contract returns false for an invalid proof
    });
});


describe("Multiplier3 with Groth16", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier"); // Get the contract 
        verifier = await Verifier.deploy(); // Deploy the contract
        await verifier.deployed(); // Wait for the contract to be deployed
    });

    it("Circuit should multiply three numbers correctly", async function () {
        //[assignment] insert your script here
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom"); // Get the circuit

        const INPUT = { // Create the input
            "a": 2,
            "b": 3,
            "c": 4
        }

        const witness = await circuit.calculateWitness(INPUT, true); // Calculate the witness using the input

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1))); // Check that the first part is 1 (should always be 1)
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(24))); // Check that the second part is 24 (should be 2*3*4=24 in this case)
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3","c":"4"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey"); // Get the proof and public signals of the circuit using the provided inputs, wasm and zkey
        
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals); // Get the input to the smart contract from the proof and public signals
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // The calldata is a string (that contains lists of hexadecimal numbers), so we need to convert it to an array of BigInts strings
    
        const a = [argv[0], argv[1]]; // Get a from the first two elements of the array
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]]; // Get b from the next four elements of the array
        const c = [argv[6], argv[7]]; // Get c from the next two elements of the array
        const Input = argv.slice(8); // Get the input from the rest (last element) of the array

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true; // Check if the proof is correct
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        expect(await verifier.verifyProof([0, 0], [[0, 0], [0, 0]], [0, 0], [0])).to.be.false; // Make sure the contract returns false for an invalid proof
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier"); // Get the contract 
        verifier = await Verifier.deploy(); // Deploy the contract
        await verifier.deployed(); // Wait for the contract to be deployed
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"2","b":"3","c":"4"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey"); // Get the proof and public signals of the circuit using the provided inputs, wasm and zkey

        //console.log(proof, publicSignals);
        
        const calldata = await plonk.exportSolidityCallData(proof, publicSignals); // Get the input to the smart contract from the proof and public signals

        //console.log(calldata);
    
        //const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString()); // This now has only two elements, the proof and the public signals

        //console.log(argv);

        // format: function verifyProof(bytes memory proof, uint[] memory pubSignals)
        // proof type is bytes so unlike before we need to use the initial output
        //console.log(calldata.split(',')[0])
        expect(await verifier.verifyProof(calldata.split(',')[0] , publicSignals)).to.be.true; // Check if the proof is correct
    });
    
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        expect(await verifier.verifyProof("0x00", [0])).to.be.false; // Make sure the contract returns false for an invalid proof
    });
});