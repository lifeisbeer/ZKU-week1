pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
//include ""; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    signal res[n][n];
    signal outcome[n];
    component e[n];

    for(var i = 0; i < n; i++) { // for each equation
        res[i][0] <== A[i][0] * x[0];
        for(var j = 1; j < n; j++) { // for each variable
            res[i][j] <== res[i][j-1] + A[i][j] * x[j];
        }
        // the result is in res[i][n-1]

        e[i] = IsEqual(); // check if the resualt is equal with b: 1 if equal, 0 otherwise
        e[i].in[0] <== res[i][n-1]; 
        e[i].in[1] <== b[i];
    }

    outcome[0] <== e[0].out;
    for(var i = 1; i < n; i++) {
        outcome[i] <== outcome[i-1] * e[i].out; // multiply all outcomes. if any of the equations is not satisfied, its outcome will be 0, makin the final outcome 0. otherwise it will be 1*1*...*1 = 1.
    }

    out <== outcome[n-1];
}

component main {public [A, b]} = SystemOfEquations(3);