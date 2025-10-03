# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "LevelUp" [ref=e4]:
        - /url: /
        - text: Level
        - generic [ref=e5]: Up
      - navigation [ref=e6]:
        - link "Sign in" [ref=e7] [cursor=pointer]:
          - /url: /auth/login
  - main [ref=e8]:
    - generic [ref=e9]:
      - heading "Welcome back, there 👋" [level=1] [ref=e11]
      - generic [ref=e13]:
        - generic [ref=e14]:
          - heading "Foundations" [level=2] [ref=e15]
          - generic [ref=e16]: 0/1
        - list [ref=e17]:
          - listitem [ref=e18]:
            - generic [ref=e19]:
              - heading "The Role of Managers" [level=3] [ref=e20]
              - paragraph [ref=e21]: 5 min • Ch 1
              - link "Start" [ref=e23] [cursor=pointer]:
                - /url: /learn/e65a2f07-6cd4-45cf-a22d-754b094ea88b
  - alert [ref=e24]
```