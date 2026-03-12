import { useState } from "react";
import { HelpCircle, Shield, AlertTriangle, MessageCircle, ChevronDown, ChevronUp, Book, Scale, Heart, Zap } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  { q: "How do I change my look?", a: "Open the Habbo client and click the clothing icon in your toolbar. You can customize your avatar's hair, clothes, and accessories from there." },
  { q: "How do I earn credits?", a: "Credits can be earned through events, trading, or purchasing VIP packages from the Store page. Staff also run regular credit giveaways!" },
  { q: "How do I create a room?", a: "In the Habbo client, go to the Navigator and click 'Create Room'. Choose a room model, give it a name, and you're all set." },
  { q: "How do I add friends?", a: "Click on another player in-game and select 'Add Friend' from the action menu. They'll receive a friend request." },
  { q: "How do I trade items?", a: "Walk up to another player, click on them, and select 'Trade'. Both players can add items to the trade window before confirming." },
  { q: "How do I join a group/guild?", a: "Visit a group's room or find a group through the Groups tab in the Navigator. Click the group badge and select 'Join'." },
  { q: "I forgot my password, what do I do?", a: "Go to the Forgot Password page from the login screen. Enter your username and the email associated with your account to reset your password." },
  { q: "How do I report a player?", a: "Use the in-game report system by clicking on the player and selecting 'Report'. You can also contact staff through the Community page." },
  { q: "What are duckets/pixels?", a: "Duckets (pixels) are a secondary currency earned by being online. They can be used to purchase certain furniture and room effects." },
  { q: "How do I become staff?", a: "Staff positions are earned, not given. Be active, helpful, follow the rules, and apply when applications are open. Check the Community page for announcements." },
];

const rules = [
  { icon: Shield, title: "No Scamming or Fraud", desc: "Do not scam, deceive, or defraud other players. All trades must be honest and fair." },
  { icon: AlertTriangle, title: "No Harassment or Bullying", desc: "Treat all players with respect. Harassment, hate speech, discrimination, and bullying are strictly prohibited." },
  { icon: Scale, title: "No Exploiting or Cheating", desc: "Do not exploit bugs, use third-party tools, or cheat in any way. Report bugs to staff immediately." },
  { icon: MessageCircle, title: "No Inappropriate Content", desc: "Keep chat and room content appropriate. No sexual content, excessive profanity, or disturbing material." },
  { icon: Zap, title: "No Advertising", desc: "Do not advertise other hotels, websites, or services. This includes linking to external sites in chat." },
  { icon: Heart, title: "Respect Staff Decisions", desc: "Staff decisions are final. If you disagree, you may appeal through proper channels, but do not argue in public." },
  { icon: Book, title: "One Account Per Person", desc: "Multi-accounting is not allowed. Each player should have one account. Alts may be banned without warning." },
  { icon: Shield, title: "No Account Sharing", desc: "Do not share your account with anyone. You are responsible for all actions taken on your account." },
];

export function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"faq" | "rules" | "support">("faq");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-sky-800 to-indigo-700 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Help Center
        </div>
        <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
          <h1 className="text-2xl font-bold text-white mb-2">How can we help you?</h1>
          <p className="text-sm text-zinc-400">Find answers to common questions, read our rules, or get support from the team.</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: "faq" as const, label: "FAQ", icon: HelpCircle },
          { key: "rules" as const, label: "Rules", icon: Shield },
          { key: "support" as const, label: "Support", icon: MessageCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded transition-all ${
              activeSection === key
                ? "bg-emerald-700 text-white font-semibold"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* FAQ Section */}
      {activeSection === "faq" && (
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Frequently Asked Questions
          </div>
          <div className="bg-zinc-900 border border-zinc-800 border-t-0 divide-y divide-zinc-800">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/40 transition-all"
                >
                  <span className="text-sm font-medium text-zinc-200">{faq.q}</span>
                  {openFAQ === i ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                </button>
                {openFAQ === i && (
                  <div className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Section */}
      {activeSection === "rules" && (
        <div className="space-y-4">
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-red-800 to-red-700 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Hotel Rules
            </div>
            <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
              <p className="text-sm text-zinc-400 mb-4">
                All players must follow these rules at all times. Violations may result in mutes, bans, or permanent account removal.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rules.map((rule, i) => {
                  const RuleIcon = rule.icon;
                  return (
                    <div key={i} className="p-4 bg-black/30 rounded-lg border border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <RuleIcon className="w-4 h-4 text-red-400" />
                        <h3 className="text-sm font-bold text-zinc-200">{rule.title}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed">{rule.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Punishment System
            </div>
            <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-900/10 border border-yellow-900/20 rounded-lg">
                  <span className="text-lg">1st</span>
                  <div>
                    <span className="text-sm font-bold text-yellow-400">Warning</span>
                    <p className="text-xs text-zinc-500">A verbal or written warning from staff.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-900/10 border border-orange-900/20 rounded-lg">
                  <span className="text-lg">2nd</span>
                  <div>
                    <span className="text-sm font-bold text-orange-400">Temporary Mute</span>
                    <p className="text-xs text-zinc-500">1-24 hour mute depending on severity.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-900/10 border border-red-900/20 rounded-lg">
                  <span className="text-lg">3rd</span>
                  <div>
                    <span className="text-sm font-bold text-red-400">Temporary Ban</span>
                    <p className="text-xs text-zinc-500">1-7 day account ban. All progress is preserved.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-900/30 rounded-lg">
                  <span className="text-lg">4th</span>
                  <div>
                    <span className="text-sm font-bold text-red-500">Permanent Ban</span>
                    <p className="text-xs text-zinc-500">Permanent account removal. No appeals for repeated offenders.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Section */}
      {activeSection === "support" && (
        <div className="space-y-4">
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-purple-800 to-purple-700 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Get Support
            </div>
            <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0 space-y-4">
              <p className="text-sm text-zinc-400">
                Need help with something that isn't covered in the FAQ? Here are the ways you can reach our team:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-black/30 rounded-lg border border-zinc-800">
                  <h3 className="text-sm font-bold text-sky-400 mb-2">In-Game Support</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Use the <span className="text-zinc-300 font-mono">:help</span> command in-game to call a staff member to your room. Available during active staff hours.
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-zinc-800">
                  <h3 className="text-sm font-bold text-emerald-400 mb-2">Community Posts</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Post in the Community section under the "Help" category. Staff and experienced players can help answer your questions.
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-zinc-800">
                  <h3 className="text-sm font-bold text-amber-400 mb-2">Account Issues</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    For account recovery, bans, or billing issues — contact a Head Admin+ through the staff page or in-game. Include your username and details.
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-zinc-800">
                  <h3 className="text-sm font-bold text-purple-400 mb-2">Bug Reports</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Found a bug? Report it in the Community page under "Help" category with steps to reproduce. Do NOT exploit bugs — report them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
