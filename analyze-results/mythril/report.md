# Mythril analysis on  depth 22

```
mythril.laser.plugin.plugins.coverage.coverage_plugin INFO: Achieved 2.71% coverage for code: 60a06040523480156200........00115e2df4064736f6c634300080d0033
```
## Time of analysis
```
mythril.laser.plugin.plugins.instruction_profiler INFO: Total: 1.0475804805755615 s
```

## Bytecode stats

| bytecode  | % used in contract | amount used | total  execution time | average execution time | minimum execution time | maximum execution time |
|-----------|--------------------|-------------|-----------------------|------------------------|------------------------|------------------------|
| AND       | 1.4104 %           | 3           | 0.0148 s              | 0.0049 s               | 0.0048 s               | 0.0051 s               |
| CALLVALUE | 0.3979 %           | 1           | 0.0042 s              | 0.0042 s               | 0.0042 s               | 0.0042 s               |
| DUP1      | 0.7708 %           | 2           | 0.0081 s              | 0.0040 s               | 0.0039 s               | 0.0042 s               |
| DUP2      | 2.9092 %           | 7           | 0.0305 s              | 0.0044 s               | 0.0040 s               | 0.0052 s               |
| DUP3      | 2.5333 %           | 6           | 0.0265 s              | 0.0044 s               | 0.0039 s               | 0.0049 s               |
| DUP4      | 1.5781 %           | 4           | 0.0165 s              | 0.0041 s               | 0.0039 s               | 0.0045 s               |
| DUP5      | 1.6003 %           | 4           | 0.0168 s              | 0.0042 s               | 0.0040 s               | 0.0044 s               |
| EQ        | 1.0379 %           | 2           | 0.0109 s              | 0.0054 s               | 0.0050 s               | 0.0059 s               |
| EXP       | 0.7289 %           | 1           | 0.0076 s              | 0.0076 s               | 0.0076 s               | 0.0076 s               |
| GT        | 0.5384 %           | 1           | 0.0056 s              | 0.0056 s               | 0.0056 s               | 0.0056 s               |
| ISZERO    | 1.7244 %           | 3           | 0.0181 s              | 0.0060 s               | 0.0052 s               | 0.0068 s               |
| JUMP      | 12.7486 %          | 15          | 0.1336 s              | 0.0089 s               | 0.0085 s               | 0.0094 s               |
| JUMPDEST  | 7.6925 %           | 18          | 0.0806 s              | 0.0045 s               | 0.0041 s               | 0.0051 s               |
| JUMPI     | 9.4054 %           | 7           | 0.0985 s              | 0.0141 s               | 0.0110 s               | 0.0259 s               |
| LT        | 2.2963 %           | 4           | 0.0241 s              | 0.0060 s               | 0.0051 s               | 0.0067 s               |
| MSTORE    | 12.4231 %          | 1           | 0.1301 s              | 0.1301 s               | 0.1301 s               | 0.1301 s               |
| OR        | 0.4653 %           | 1           | 0.0049 s              | 0.0049 s               | 0.0049 s               | 0.0049 s               |
| POP       | 7.4278 %           | 18          | 0.0778 s              | 0.0043 s               | 0.0039 s               | 0.0049 s               |
| PUSH1     | 9.4221 %           | 20          | 0.0987 s              | 0.0049 s               | 0.0041 s               | 0.0105 s               |
| PUSH2     | 0.4860 %           | 1           | 0.0051 s              | 0.0051 s               | 0.0051 s               | 0.0051 s               |
| PUSH3     | 10.4712 %          | 23          | 0.1097 s              | 0.0048 s               | 0.0040 s               | 0.0082 s               |
| PUSH32    | 0.4773 %           | 1           | 0.0050 s              | 0.0050 s               | 0.0050 s               | 0.0050 s               |
| PUSH4     | 0.3857 %           | 1           | 0.0040 s              | 0.0040 s               | 0.0040 s               | 0.0040 s               |
| SHL       | 0.6942 %           | 1           | 0.0073 s              | 0.0073 s               | 0.0073 s               | 0.0073 s               |
| SHR       | 0.7335 %           | 1           | 0.0077 s              | 0.0077 s               | 0.0077 s               | 0.0077 s               |
| SWAP1     | 5.0789 %           | 12          | 0.0532 s              | 0.0044 s               | 0.0039 s               | 0.0051 s               |
| SWAP2     | 2.8741 %           | 7           | 0.0301 s              | 0.0043 s               | 0.0039 s               | 0.0047 s               |
| SWAP3     | 1.2681 %           | 3           | 0.0133 s              | 0.0044 s               | 0.0041 s               | 0.0050 s               |
| SWAP4     | 0.4203 %           | 1           | 0.0044 s              | 0.0044 s               | 0.0044 s               | 0.0044 s               |

## Analysis issues
```
mythril.analysis.security INFO: Starting analysis
mythril.analysis.security DEBUG: Retrieving results for Caller can redirect execution to arbitrary bytecode locations
mythril.analysis.security DEBUG: Retrieving results for Caller can write to arbitrary storage locations
mythril.analysis.security DEBUG: Retrieving results for Delegatecall to a user-specified address
mythril.analysis.security DEBUG: Retrieving results for Control flow depends on a predictable environment variable
mythril.analysis.security DEBUG: Retrieving results for Control flow depends on tx.origin
mythril.analysis.security DEBUG: Retrieving results for Any sender can withdraw ETH from the contract account
mythril.analysis.security DEBUG: Retrieving results for Assertion violation
mythril.analysis.security DEBUG: Retrieving results for External call to another contract
mythril.analysis.security DEBUG: Retrieving results for Multiple external calls in the same transaction
mythril.analysis.security DEBUG: Retrieving results for State change after an external call
mythril.analysis.security DEBUG: Retrieving results for Contract can be accidentally killed by anyone
mythril.analysis.security DEBUG: Retrieving results for Return value of an external call is not checked
mythril.analysis.security DEBUG: Retrieving results for A user-defined assertion has been triggered
```
## Solver statistics
```
mythril.mythril.mythril_analyzer INFO: Solver statistics: 
Query count: 10 
Solver time: 0.23960137367248535
The analysis was completed successfully. No issues were detected.
```