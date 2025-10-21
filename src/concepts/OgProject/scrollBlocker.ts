type TimeInterval = { start: string; end: string };
type App = string;

interface UserState {
  blockedPeriods: Map<string, Set<App>>;
  scrollingBlocked: Map<App, boolean>;
}

/**
 * Scroll helps users manage their app usage and screen time.
 * Users can manually block apps or let an AI model suggest blocking times automatically.
 */
export class Scroll {
  users: Map<string, UserState>;
  apps: Set<App>;
  scrollingApps: Set<App>;
  nonScrollingApps: Set<App>;

  constructor() {
    this.users = new Map();
    this.apps = new Set();
    this.scrollingApps = new Set();
    this.nonScrollingApps = new Set();
  }

  addUser(user: string) {
    if (this.users.has(user)) return;
    this.users.set(user, {
      blockedPeriods: new Map(),
      scrollingBlocked: new Map(),
    });
  }

  downloadApp(app: App, isScrollingApp: boolean) {
    if (this.apps.has(app)) {
      throw new Error(`FAILED: App "${app}" already exists.`);
    }
    this.apps.add(app);
    if (isScrollingApp) this.scrollingApps.add(app);
    else this.nonScrollingApps.add(app);
  }

  setBlockManual(
    user: string,
    time: TimeInterval,
    app: App,
    scrollBlocked: boolean,
  ) {
    const userState = this.users.get(user);
    if (!userState) throw new Error(`FAILED: User "${user}" not found.`);
    if (!this.apps.has(app)) throw new Error(`FAILED: App "${app}" not found.`);
    if (scrollBlocked && this.nonScrollingApps.has(app)) {
      throw new Error(
        `FAILED: Cannot block scrolling on non-scrolling app "${app}".`,
      );
    }
    const key = `${time.start}-${time.end}`;
    if (!userState.blockedPeriods.has(key)) {
      userState.blockedPeriods.set(key, new Set());
    }

    userState.blockedPeriods.get(key)!.add(app);
    userState.scrollingBlocked.set(app, scrollBlocked);
    console.log(
      `SUCCESS: Block set for ${app} from ${time.start} to ${time.end}.`,
    );
  }

  removeBlock(user: string, time: TimeInterval, app: App) {
    const userState = this.users.get(user);
    if (!userState) throw new Error(`FAILED: User "${user}" not found.`);
    if (!this.apps.has(app)) {
      throw new Error(`FAILED: "${app}" does not exist in apps.`);
    }

    const key = `${time.start}-${time.end}`;
    const appsSet = userState.blockedPeriods.get(key);

    if (!appsSet || !appsSet.has(app)) {
      throw new Error(
        `FAILED: No block exists for app "${app}" at ${time.start}-${time.end}.`,
      );
    }

    appsSet.delete(app);

    console.log(
      `SUCCESS: Block removed for ${app} from ${time.start} to ${time.end}.`,
    );
  }
  /**
  removeBlock(user: string, time: TimeInterval, app: App) {
    const userState = this.users.get(user);
    if (!userState) throw new Error(`FAILED: User "${user}" not found.`);
    if (!this.apps || !this.apps.has(app)) {
      throw new Error(`FAILED: "${app}" does not exist in apps.`);
    }
    if (!this.apps || !this.apps.has(app)) {
      throw new Error(`FAILED: "${app}" does not exist in apps.`);
    }
    const key = `${time.start}-${time.end}`;
    userState.blockedPeriods.get(key)?.delete(app);

    console.log(
      `SUCCESS: Block removed for ${app} from ${time.start} to ${time.end}.`,
    );
  }
 */
  /**
   * Mock AI version of AISetBlock
   * (replaces Gemini LLM integration with a fake “AI” analysis)
   */
  AISetBlock(user: string) {
    const userState = this.users.get(user);
    if (!userState) throw new Error(`FAILED: User "${user}" not found.`);

    console.log(`🤖 AISetBlock: Simulating AI for user "${user}"...`);

    // Fake AI output — same format as before
    const result = {
      suggestions: [
        { app: "Instagram", start: "20:00", end: "22:00" },
        { app: "TikTok", start: "09:00", end: "11:00" },
      ],
    };

    // Validate and apply
    for (const suggestion of result.suggestions) {
      if (!this.apps.has(suggestion.app)) {
        console.log(`Skipping unknown app: ${suggestion.app}`);
        continue;
      }
      this.setBlockManual(
        user,
        { start: suggestion.start, end: suggestion.end },
        suggestion.app,
        true,
      );
    }

    console.log(`SUCCESS: Mock AI suggestions applied for "${user}".`);
  }
}
