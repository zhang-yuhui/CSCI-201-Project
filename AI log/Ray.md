# AI Log - Ray

## Prompt

### Starter code

> create a starter code for a web app with front end ReactJS and backend Spring boot with java 21 and MySQL DB, and I would also like a user authentification labary for manage user login and make it easy
> specifically use spring security, maven and create react app
> Also, write the appropriate `.gitignore`

### Main page for testing login

> can you create a nav bar to route these path? Include the `dashbord` and the `login/out` button

## Issues

### Issues with testing protected endpoint

> why I test endpoint `http://localhost:8080/api/test/public` with GET but I still get 403 in @TestController.java

### Issues with role vs url based filter

> what's the difference of filterChain in @SecurityConfig.java:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()      // Public - no auth needed
    .requestMatchers("/api/test/public").permitAll()  // Public - no auth needed
    .anyRequest().authenticated()                      // Everything else needs auth
)
```

> and in @TestController.java (21):

``` java
@PreAuthorize("hasRole('USER')")
public ResponseEntity<String> protectedEndpoint() { ... }
```

> why both are need, can be simplified for cleaner code

### Issues with git merge comflict

> After someone else update all at the same file, merge is complicated

## Fix

### testing protected endpoint

- Updating `SecurityConfig.java` to allow `/api/test/public` without authentication:

```java
    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/test/public").permitAll()
                    .anyRequest().authenticated()
```

### role vs url based filter

- Use only **role based** authentication as some endpoint such as map or coffee shop are public but some (user profile, user's coffee rating) are protected.
- In the `SecurityConfig.java` allow all the request in http filter:

```java
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/test/public").permitAll()
    .anyRequest().authenticated()
```

### Git merge comflict

- activate option for merge by default:

```sh
cd /Users/zhangyuhui/Downloads/CSCI-201-Project && git config pull.rebase false
cd /Users/zhangyuhui/Downloads/CSCI-201-Project && git pull origin main
cd /Users/zhangyuhui/Downloads/CSCI-201-Project && git add frontend/src/App.js
```

## Explaination

- The issue is in `SecurityConfig.java`: only `/api/auth/** is permitted`, so `/api/test/public` requires authentication.
- `filterChain` in `SecurityConfig.java` (lines 55-68)
  - Purpose: HTTP-level authentication (who can access)
  - Runs before the request reaches the controller
  - Determines if an endpoint requires authentication
  - URL pattern-based
  - Coarse-grained: public vs authenticated
- `@PreAuthorize("hasRole('USER')")` in `TestController.java` (line 21)
  - Purpose: Method-level authorization (what roles are allowed)
  - Runs after authentication, before the method executes
  - Checks roles/permissions of the authenticated user
  - Method-level
  - Fine-grained: which roles can access
- After using only role based authentication:
  1. Request comes in → JWT filter processes it (sets authentication if token is valid)
  2. Request reaches controller → `@PreAuthorize` annotation checks authorization
  3. If authorized → method executes
  4. If not authorized → 403 Forbidde
- For the merge issue is that my  local branch has a commit (`43cb1bb - Finished login backend and User DB...`) that isn't on the remote, and the remote has two commits (`acd006a and 34bc1d2 about MapWithMarker`) that aren't on your local branch.
