# potato-search
search in your lists

# example
``` ts
import { Search } from "potato-search";

const search = new Search({ markBefore: "*", markAfter: "*" });
search
    .term("bi")
    .in("Bill")
    .marked;
// "*Bi*ll"
```
