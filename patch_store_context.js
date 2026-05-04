const fs = require('fs');
const file = 'apps/site/src/app/(admin)/admin/components/StoreContext.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useCallback')) {
  content = content.replace("import React, { createContext, useContext, useState, useEffect } from 'react'", "import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'");
  content = content.replace(
    "const setAndSaveStore = (store: StoreType) => {",
    "const setAndSaveStore = useCallback((store: StoreType) => {"
  );
  content = content.replace(
    "router.refresh() // Trigger Server Components to re-render with new cookie\n  }",
    "router.refresh() // Trigger Server Components to re-render with new cookie\n  }, [router])"
  );
  fs.writeFileSync(file, content);
  console.log("Patched StoreContext.tsx");
} else {
  console.log("Already patched");
}
