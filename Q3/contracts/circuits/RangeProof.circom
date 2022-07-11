pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";

template RangeProof(n) {
    assert(n <= 252);
    signal input in; // this is the number to be proved inside the range
    signal input range[2]; // the two elements should be the range, i.e. [lower bound, upper bound]
    signal output out;

    component lt = LessEqThan(n);
    component gt = GreaterEqThan(n);

    // [assignment] insert your code here

    signal out_lt;
    signal out_gt;

    lt.in[0] <== in;
    lt.in[1] <== range[1]; // Checking if the input is less than or equal to the upper bound 
    out_lt <== lt.out;

    gt.in[0] <== in;
    gt.in[1] <== range[0]; // Checking if the input is greater than or equal to the lower bound 
    out_gt <== gt.out;

    out <== out_lt * out_gt; // The final output is 1 if both intermidiary results are 1, 0 otherwise. (I get an error using &, so switched to *)
}