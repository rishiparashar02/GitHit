import { useEffect, useMemo, useState } from 'react'
import {
  BookOpenText,
  BriefcaseBusiness,
  Filter,
  GitBranch,
  LayoutGrid,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import './App.css'
import { getGithitVisitCount, incrementGithitVisit, isVisitTrackingConfigured } from './visitCounter'

const AUTHOR_GITHUB = 'https://github.com/rishiparashar02'

function categorySlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, '-')
}

type GitCommand = {
  command: string
  category: string
  description: string
  example: string
}

const gitCommands: GitCommand[] = [
  { command: 'git init', category: 'Setup', description: 'Initialize a local Git repository.', example: 'git init' },
  { command: 'git clone', category: 'Setup', description: 'Copy an existing remote repository to local.', example: 'git clone https://github.com/org/repo.git' },
  { command: 'git config', category: 'Setup', description: 'Set Git username, email, and defaults.', example: 'git config --global user.name "Your Name"' },
  { command: 'git help', category: 'Setup', description: 'Open help docs for commands and flags.', example: 'git help rebase' },
  { command: 'git status', category: 'Basics', description: 'Show tracked, changed, and staged files.', example: 'git status' },
  { command: 'git add', category: 'Basics', description: 'Stage file changes for the next commit.', example: 'git add src/App.tsx' },
  { command: 'git commit', category: 'Basics', description: 'Save staged changes as a snapshot.', example: 'git commit -m "feat: add hero section"' },
  { command: 'git log', category: 'Basics', description: 'View commit history.', example: 'git log --oneline --graph --decorate' },
  { command: 'git diff', category: 'Basics', description: 'Compare changes between states.', example: 'git diff HEAD~1 HEAD' },
  { command: 'git show', category: 'Basics', description: 'Inspect details of a commit or object.', example: 'git show a1b2c3d' },
  { command: 'git mv', category: 'Basics', description: 'Move or rename files in Git.', example: 'git mv old-name.ts new-name.ts' },
  { command: 'git rm', category: 'Basics', description: 'Delete files and stage the removal.', example: 'git rm old-file.txt' },
  { command: 'git restore', category: 'Basics', description: 'Restore working tree files.', example: 'git restore src/App.tsx' },
  { command: 'git reset', category: 'Basics', description: 'Unstage or move branch pointers safely.', example: 'git reset --soft HEAD~1' },
  { command: 'git branch', category: 'Branching', description: 'List, create, or delete branches.', example: 'git branch feature/auth-flow' },
  { command: 'git switch', category: 'Branching', description: 'Move between branches quickly.', example: 'git switch main' },
  { command: 'git checkout', category: 'Branching', description: 'Legacy command to switch or restore.', example: 'git checkout -b feature/landing' },
  { command: 'git merge', category: 'Branching', description: 'Combine another branch into current.', example: 'git merge feature/ui-refresh' },
  { command: 'git rebase', category: 'Branching', description: 'Replay commits onto a new base.', example: 'git rebase origin/main' },
  { command: 'git cherry-pick', category: 'Branching', description: 'Apply a specific commit to current branch.', example: 'git cherry-pick a1b2c3d' },
  { command: 'git tag', category: 'Branching', description: 'Create release tags for versions.', example: 'git tag -a v1.0.0 -m "Initial release"' },
  { command: 'git stash', category: 'Stash', description: 'Temporarily save uncommitted work.', example: 'git stash push -m "wip: checkout flow"' },
  { command: 'git stash list', category: 'Stash', description: 'List saved stashes.', example: 'git stash list' },
  { command: 'git stash show', category: 'Stash', description: 'Preview stash changes.', example: 'git stash show -p stash@{0}' },
  { command: 'git stash pop', category: 'Stash', description: 'Re-apply and remove latest stash.', example: 'git stash pop' },
  { command: 'git stash apply', category: 'Stash', description: 'Apply a stash without deleting it.', example: 'git stash apply stash@{1}' },
  { command: 'git stash drop', category: 'Stash', description: 'Delete one stash entry.', example: 'git stash drop stash@{0}' },
  { command: 'git stash clear', category: 'Stash', description: 'Delete all stashes.', example: 'git stash clear' },
  { command: 'git remote', category: 'Remote', description: 'Manage remote repositories like origin.', example: 'git remote -v' },
  { command: 'git remote add origin', category: 'Remote', description: 'Add default remote named origin.', example: 'git remote add origin https://github.com/org/repo.git' },
  { command: 'git fetch', category: 'Remote', description: 'Download refs and objects from remote.', example: 'git fetch origin' },
  { command: 'git pull', category: 'Remote', description: 'Fetch and integrate remote branch updates.', example: 'git pull origin main' },
  { command: 'git push', category: 'Remote', description: 'Upload commits to remote branch.', example: 'git push origin main' },
  { command: 'git push -u', category: 'Remote', description: 'Set upstream tracking for current branch.', example: 'git push -u origin feature/search' },
  { command: 'git branch -u', category: 'Remote', description: 'Link local branch to upstream branch.', example: 'git branch -u origin/main main' },
  { command: 'git ls-remote', category: 'Remote', description: 'List refs available on remote.', example: 'git ls-remote --heads origin' },
  { command: 'git pull --rebase', category: 'Remote', description: 'Rebase local commits after fetching.', example: 'git pull --rebase origin main' },
  { command: 'git upstream', category: 'Concept', description: 'Upstream means the tracked remote branch for your local branch.', example: 'git branch -vv' },
  { command: 'git origin', category: 'Concept', description: 'Origin is the conventional default remote name.', example: 'git remote show origin' },
  { command: 'git reflog', category: 'Recovery', description: 'Track all branch and HEAD movements.', example: 'git reflog' },
  { command: 'git revert', category: 'Recovery', description: 'Undo changes by creating an inverse commit.', example: 'git revert a1b2c3d' },
  { command: 'git bisect', category: 'Recovery', description: 'Find bad commits with binary search.', example: 'git bisect start' },
  { command: 'git clean', category: 'Recovery', description: 'Remove untracked files/directories.', example: 'git clean -fd' },
  { command: 'git blame', category: 'Inspection', description: 'Show last commit per line in file.', example: 'git blame src/App.tsx' },
  { command: 'git shortlog', category: 'Inspection', description: 'Summarize commits by author.', example: 'git shortlog -sn' },
  { command: 'git describe', category: 'Inspection', description: 'Show nearest tag reachable from commit.', example: 'git describe --tags' },
  { command: 'git archive', category: 'Inspection', description: 'Create archive from repository files.', example: 'git archive --format=zip HEAD > source.zip' },
  { command: 'git submodule', category: 'Advanced', description: 'Manage repositories nested as dependencies.', example: 'git submodule update --init --recursive' },
  { command: 'git worktree', category: 'Advanced', description: 'Checkout multiple branches at once.', example: 'git worktree add ../repo-hotfix hotfix/urgent-fix' },
  { command: 'git sparse-checkout', category: 'Advanced', description: 'Checkout only selected folders.', example: 'git sparse-checkout set src docs' },
  { command: 'git gc', category: 'Advanced', description: 'Optimize repository storage.', example: 'git gc --aggressive' },
  { command: 'git fsck', category: 'Advanced', description: 'Verify object database integrity.', example: 'git fsck --full' },
  { command: 'git notes', category: 'Advanced', description: 'Attach notes to commits without rewriting.', example: 'git notes add -m "Deployed to production"' },
  { command: 'git bundle', category: 'Advanced', description: 'Transfer repository as a single file.', example: 'git bundle create repo.bundle --all' },
]

function App() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [visits, setVisits] = useState<number | null>(null)
  const [visitLoadFailed, setVisitLoadFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const sessionKey = 'githit-session-counted'
    const alreadyCounted = sessionStorage.getItem(sessionKey) === 'true'

    ;(async () => {
      if (!isVisitTrackingConfigured()) {
        if (!cancelled) {
          setVisitLoadFailed(true)
          setVisits(null)
        }
        return
      }
      try {
        const n = alreadyCounted ? await getGithitVisitCount() : await incrementGithitVisit()
        if (cancelled) return
        setVisits(n)
        setVisitLoadFailed(false)
        if (!alreadyCounted) sessionStorage.setItem(sessionKey, 'true')
      } catch {
        if (!cancelled) {
          setVisitLoadFailed(true)
          setVisits(null)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(gitCommands.map((item) => item.category)))],
    [],
  )

  const filteredCommands = useMemo(() => {
    return gitCommands.filter((item) => {
      const byCategory = selectedCategory === 'All' || item.category === selectedCategory
      const normalizedQuery = query.trim().toLowerCase()
      const byQuery =
        normalizedQuery.length === 0 ||
        item.command.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.example.toLowerCase().includes(normalizedQuery)
      return byCategory && byQuery
    })
  }, [query, selectedCategory])

  return (
    <div className="site">
      <div
        className="visit-counter"
        aria-live="polite"
        title={
          visitLoadFailed
            ? 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then run supabase-visits.sql in your Supabase project.'
            : undefined
        }
      >
        <Users size={16} />
        <span>
          {visitLoadFailed ? '—' : visits === null ? '…' : visits.toLocaleString()} visits
        </span>
      </div>

      <header className="header">
        <div className="brand">
          <GitBranch size={22} />
          <span>GitHit</span>
        </div>
        <nav className="nav">
          <a href="#commands">Commands</a>
          <a href="#why-learn">Why learn Git</a>
          <a href="#learning">Learning roadmap</a>
          <a href={AUTHOR_GITHUB} target="_blank" rel="noreferrer">
            Contact
          </a>
        </nav>
        <a className="primary-btn" href="#commands">
          Start Learning
        </a>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-text">
            <p className="eyebrow">The complete Git mastery hub</p>
            <h1>Learn every Git command from beginner to advanced</h1>
            <p>
              Plain-language examples for everyday Git: save your work, share with a team, fix mistakes,
              and level up from first commit to solid workflows.
            </p>
            <div className="hero-cta">
              <a className="primary-btn" href="#commands">
                Explore Command Library
              </a>
              <a className="ghost-btn" href="#learning">
                View learning roadmap
              </a>
            </div>
          </div>
          <div className="hero-card">
            <Sparkles size={20} />
            <h3>What you get</h3>
            <ul>
              <li>{gitCommands.length}+ essential and advanced Git commands</li>
              <li>Searchable examples ready to copy and run</li>
              <li>Concepts like origin, upstream, rebase, stash, reflog</li>
            </ul>
          </div>
        </section>

        <section id="commands" className="commands-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Command Library</p>
              <h2>All major Git commands in one place</h2>
            </div>
            <span>{filteredCommands.length} shown</span>
          </div>

          <div className="controls">
            <label className="search-box">
              <Search size={16} />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search command, concept, or example..."
                aria-label="Search git commands"
              />
            </label>
            <div className="filters">
              <Filter size={14} />
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? `chip active chip--${categorySlug(category)}`
                      : `chip chip--${categorySlug(category)}`
                  }
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="command-grid">
            {filteredCommands.map((item) => (
              <article key={`${item.command}-${item.category}`} className="command-card">
                <div className="command-top">
                  <span className={`badge badge--${categorySlug(item.category)}`}>{item.category}</span>
                  <LayoutGrid size={14} />
                </div>
                <h3>{item.command}</h3>
                <p>{item.description}</p>
                <code>{item.example}</code>
              </article>
            ))}
          </div>
        </section>

        <section id="why-learn" className="why-learn-section">
          <p className="eyebrow">Why learn this</p>
          <h2>Git is the skill; GitHub and GitLab are where you use it</h2>
          <p className="why-lead">
            You only learn Git once. After that, the same commands work whether your team uses GitHub, GitLab,
            or another host—only the website and clone URL change.
          </p>
          <ul className="why-simple-list">
            <li>
              <strong>Undo mistakes safely</strong> - see history, bring back old versions, and experiment on
              branches without losing work.
            </li>
            <li>
              <strong>Work with others</strong> - push your commits, pull updates, and resolve conflicts when
              two people edit the same files.
            </li>
            <li>
              <strong>One habit, many jobs</strong> - Git is the standard for software, data, and docs; it
              shows up in almost every technical role.
            </li>
          </ul>
          <div className="why-grid">
            <article className="why-card why-card--git">
              <h3>Git (on your computer)</h3>
              <p>
                Git remembers every saved version of your project. You commit snapshots, switch branches, and
                merge work—all from the terminal. The command library above is this layer.
              </p>
              <a
                className="text-link-btn"
                href="https://git-scm.com/doc"
                target="_blank"
                rel="noreferrer"
              >
                Official Git documentation
              </a>
            </article>
            <article className="why-card why-card--github">
              <h3>GitHub (hosting + collaboration)</h3>
              <p>
                GitHub stores your repo online, hosts pull requests and issues, and can run automated checks.
                You still run <code>git push</code> and <code>git pull</code>; the site is the hub for review
                and teamwork.
              </p>
              <div className="why-actions">
                <a className="primary-btn" href="https://github.com" target="_blank" rel="noreferrer">
                  GitHub.com
                </a>
                <a
                  className="ghost-btn"
                  href="https://docs.github.com/en/get-started/quickstart/hello-world"
                  target="_blank"
                  rel="noreferrer"
                >
                  Hello World guide
                </a>
              </div>
            </article>
            <article className="why-card why-card--gitlab">
              <h3>GitLab (hosting + DevOps)</h3>
              <p>
                GitLab is another popular place to host Git repos, with merge requests and built-in CI/CD. Your
                Git commands are identical; you point <code>origin</code> at GitLab instead of GitHub.
              </p>
              <div className="why-actions">
                <a className="primary-btn" href="https://about.gitlab.com" target="_blank" rel="noreferrer">
                  GitLab
                </a>
                <a
                  className="ghost-btn"
                  href="https://docs.gitlab.com/ee/gitlab-basics/start-using-git.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Start using Git on GitLab
                </a>
              </div>
            </article>
          </div>
        </section>

        <section id="learning" className="learning-section">
          <p className="eyebrow">Learning roadmap</p>
          <h2>Start at step 1- each level builds on the last</h2>
          <p className="roadmap-intro">
            Use the filters in the command library to match each stage. Spend a few minutes trying each
            example in a test folder so your muscle memory sticks.
          </p>
          <div className="steps">
            <article className="roadmap-card">
              <div className="roadmap-title-row">
                <span className="roadmap-step-num">1</span>
                <BookOpenText size={18} className="roadmap-icon" aria-hidden />
                <h3>Basics - Save and Inspect your work</h3>
              </div>
              <p className="roadmap-goal">
                Goal: create a repo, stage changes, commit, and read history when something looks wrong.
              </p>
              <ul className="roadmap-tasks">
                <li>
                  In the library, filter <strong>Setup</strong> then <strong>Basics</strong>:{' '}
                  <code>git init</code>, <code>git config</code>, <code>status</code>, <code>add</code>,{' '}
                  <code>commit</code>, <code>log</code>, <code>diff</code>.
                </li>
                <li>Practice: make three small commits with clear messages so <code>git log --oneline</code> tells a story.</li>
              </ul>
            </article>
            <article className="roadmap-card">
              <div className="roadmap-title-row">
                <span className="roadmap-step-num">2</span>
                <GitBranch size={18} className="roadmap-icon" aria-hidden />
                <h3>Branches &amp; remotes - work in parallel</h3>
              </div>
              <p className="roadmap-goal">
                Goal: use a branch for a feature, connect to a remote, and share work without overwriting others.
              </p>
              <ul className="roadmap-tasks">
                <li>
                  Filter <strong>Branching</strong> and <strong>Remote</strong>: <code>branch</code>,{' '}
                  <code>switch</code>, <code>merge</code>, <code>remote</code>, <code>fetch</code>,{' '}
                  <code>pull</code>, <code>push</code>.
                </li>
                <li>
                  On GitHub or GitLab, create a repo, clone it, push a branch, and open a pull/merge request when
                  you are ready for feedback.
                </li>
              </ul>
            </article>
            <article className="roadmap-card">
              <div className="roadmap-title-row">
                <span className="roadmap-step-num">3</span>
                <BriefcaseBusiness size={18} className="roadmap-icon" aria-hidden />
                <h3>Pro workflows - stay fast and recover fast</h3>
              </div>
              <p className="roadmap-goal">
                Goal: keep history tidy, park unfinished work safely, and recover when a branch or commit goes sideways.
              </p>
              <ul className="roadmap-tasks">
                <li>
                  Explore <strong>Stash</strong>, <strong>Recovery</strong>, and <strong>Advanced</strong>:{' '}
                  <code>stash</code>, <code>rebase</code>, <code>reflog</code>, <code>revert</code>, tags for
                  releases.
                </li>
                <li>When you hit a scary message, search the library for the command Git printed—there is usually a safe fix.</li>
              </ul>
            </article>
          </div>
        </section>
      </main>

      <footer id="footer" className="footer">
        <div className="footer-grid">
          <div>
            <h4>GitHit</h4>
            <p>The complete Git command and workflow learning platform.</p>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#commands">Command library</a>
            <a href="#why-learn">Why learn Git</a>
            <a href="#learning">Learning roadmap</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href={AUTHOR_GITHUB} target="_blank" rel="noreferrer">
              GitHub - rishiparashar02
            </a>
            <a href="#why-learn">About this site</a>
          </div>
        </div>
        <p className="footer-built">GitHit - © 2026</p>
      </footer>
    </div>
  )
}

export default App
