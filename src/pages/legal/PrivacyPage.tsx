import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0b0b0d] px-4 pt-28 pb-16">
            <div className="container mx-auto max-w-4xl">
                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold">Privacy <span className="text-green-400">Policy</span></h1>
                        <p className="text-card-muted-foreground">Last updated: August 2026</p>
                    </div>

                    <Card className="border-white/10 bg-[#161616] rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-2xl text-green-400">Data Collection and Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Intro */}
                            <p className="text-card-muted-foreground">
                                PluginWizard ("we", "us", "our") respects your privacy and aims to
                                collect only the information necessary to operate and improve the service.
                            </p>
                            <p className="text-card-muted-foreground">
                                PluginWizard does not require user accounts, registration, or login.
                            </p>
                            <p className="text-card-muted-foreground">
                                When you use the plugin build/export functionality, the plugin source
                                code and configuration are temporarily transmitted to our server to
                                perform the build. The source code and configuration are processed for
                                the purpose of performing the build and are not stored as usage statistics.
                            </p>

                            {/* Usage Statistics */}
                            <h3 className="text-lg font-semibold mt-6 text-green-400">Usage Statistics</h3>
                            <p className="text-card-muted-foreground">
                                To understand how the service is used and to improve PluginWizard, we store a limited set of technical information after a build.
                            </p>
                            <p className="text-card-muted-foreground">
                                The information may include:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-card-muted-foreground marker:text-green-400">
                                <li>Plugin name</li>
                                <li>Plugin version</li>
                                <li>Length of the submitted source code</li>
                                <li>Length of the submitted configuration</li>
                                <li>Whether the build was successful</li>
                                <li>Build error information</li>
                                <li>Build duration</li>
                                <li>The date and time at which the build was completed</li>
                            </ul>

                            <p className="text-card-muted-foreground">
                                We do not intentionally store the following as part of these usage statistics:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-card-muted-foreground marker:text-green-400">
                                <li>Your source code</li>
                                <li>Your configuration contents</li>
                                <li>IP addresses</li>
                                <li>Browser or device information</li>
                                <li>Persistent identifiers used to track individual users</li>
                            </ul>

                            <p className="text-card-muted-foreground">
                                The collected information is used to understand usage of the build functionality, diagnose problems, and improve PluginWizard.
                            </p>

                            {/* Legal Basis */}
                            <h3 className="text-lg font-semibold mt-6 text-green-400">Legal Basis</h3>
                            <p className="text-card-muted-foreground">
                                Where the information collected constitutes personal data under applicable data protection law, 
                                we process it on the basis of our legitimate interests in operating, maintaining, securing, 
                                and improving PluginWizard, taking into account the interests and rights of the users of the service.
                                <br />
                                We aim to limit the information collected to what is necessary for these purposes.
                            </p>

                            {/* Data Storage */}
                            <h3 className="text-lg font-semibold mt-6 text-green-400">Data Storage</h3>
                            <p className="text-card-muted-foreground">
                                PluginWizard is self-hosted. The data described in this Privacy Policy is stored on infrastructure operated and controlled by us.
                            </p>
                            <p className="text-card-muted-foreground">
                                We do not use a third-party hosting provider to host the PluginWizard application or its database.
                            </p>
                            <p className="text-card-muted-foreground">
                                We retain usage statistics only for as long as they are reasonably necessary for the purposes described above.
                            </p>

                            {/* Server Logs */}
                            <h3 className="text-lg font-semibold mt-6 text-green-400">Server logs</h3>
                            <p className="text-card-muted-foreground">
                                Our server or network infrastructure may create technical logs as part of normal operation and security.
                                Such logs may contain technical information such as IP addresses and request timestamps.
                                <br />
                                These operational logs are separate from the usage statistics described above and are used only where necessary
                                for operating, securing, and troubleshooting the service.
                            </p>

                            {/* Data Sharing */}
                            <h3 className="text-lg font-semibold mt-6 text-green-400">Data Sharing</h3>
                            <p className="text-card-muted-foreground">
                                We do not sell or rent collected information to third parties.
                                <br />
                                We do not share usage statistics with third parties unless this is necessary
                                to comply with a legal obligation or to protect the rights, security, or integrity of the service.
                            </p>

                            {/* Your Rights */}
                            <h3 className="text-lg font-semibold mt-6 text-green-400">Your Rights</h3>
                            <p className="text-card-muted-foreground">
                                Depending on the circumstances and applicable data protection law, 
                                you may have rights regarding personal data concerning you, including the right to request access, 
                                correction, deletion, or restriction of processing, and the right to object to certain processing.
                            </p>

                            {/* Changes to This Privacy Policy */}
                            <h3 className="text-lg font-semibold mt-6 text-green-400">Changes to This Privacy Policy</h3>
                            <p className="text-card-muted-foreground">
                                We may update this Privacy Policy from time to time to reflect changes to PluginWizard or applicable legal requirements.
                            </p>
                            <p className="text-card-muted-foreground">
                                When we make material changes, we will update the date at the top of this page and, where appropriate, provide additional notice.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}