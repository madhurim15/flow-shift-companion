import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Shield, MessageSquare, Smartphone, Settings, CheckCircle2, HelpCircle } from "lucide-react";

const GITHUB_RELEASES_URL = "https://github.com/madhurim15/flow-shift-companion/releases/latest";
const FEEDBACK_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdId9R5dugT1pETsTxADCTS2tPjkJyPFa24o-0pG3VLGw9ydQ/viewform";

const BetaDownload = () => {
  const installSteps = [
    {
      icon: Download,
      title: "Download the APK",
      description: "Tap the download button below to get the latest version"
    },
    {
      icon: Settings,
      title: "Allow Installation",
      description: "When prompted, tap 'Settings' → Enable 'Install from this source'"
    },
    {
      icon: Smartphone,
      title: "Install the App",
      description: "Open the downloaded file and tap 'Install'"
    },
    {
      icon: CheckCircle2,
      title: "You're Ready!",
      description: "Open FlowFocus and complete the quick setup"
    }
  ];

  const faqs = [
    {
      question: "Is this safe to install?",
      answer: "Yes! This is the official FlowFocus beta. Android shows a warning for all apps not from the Play Store, but our app is safe and doesn't collect any personal data."
    },
    {
      question: "Why isn't it on the Play Store?",
      answer: "We're still in beta testing. Once we've gathered feedback and polished the experience, we'll publish to the Play Store."
    },
    {
      question: "How do I get updates?",
      answer: "We'll notify you when new versions are available. Just download and install the new APK - it will update automatically."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background px-4 py-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl text-primary-foreground">
            🧘
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">FlowFocus Beta</h1>
          <p className="text-muted-foreground">
            Take control of your screen time with gentle, mindful nudges that help you stay intentional.
          </p>
        </div>
      </div>

      {/* Download Section */}
      <div className="px-4 py-8">
        <Card className="mx-auto max-w-md border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <Download className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">Download for Android</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Version 1.0.0-beta • Requires Android 8.0+
            </p>
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={() => window.open(GITHUB_RELEASES_URL, '_blank')}
            >
              <Download className="h-5 w-5" />
              Download APK
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              ~15 MB • Free during beta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Installation Steps */}
      <div className="px-4 py-8">
        <div className="mx-auto max-w-md">
          <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
            How to Install
          </h2>
          <div className="space-y-4">
            {installSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="px-4 py-4">
        <Card className="mx-auto max-w-md border-green-500/20 bg-green-500/5">
          <CardContent className="flex gap-3 p-4">
            <Shield className="h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Safe & Private:</span> FlowFocus doesn't collect personal data. All your information stays on your device.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      <div className="px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-6 text-center">
            <MessageSquare className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-2 text-lg font-semibold text-foreground">Help Us Improve</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Your feedback shapes FlowFocus. Found a bug? Have a suggestion? Let us know!
            </p>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.open(FEEDBACK_FORM_URL, '_blank')}
            >
              <MessageSquare className="h-4 w-4" />
              Share Feedback
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="px-4 py-8">
        <div className="mx-auto max-w-md">
          <h2 className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold text-foreground">
            <HelpCircle className="h-5 w-5" />
            Common Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="mb-1 font-medium text-foreground">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Thank you for being a beta tester! 💜
        </p>
      </div>
    </div>
  );
};

export default BetaDownload;
