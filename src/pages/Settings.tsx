import { useSettingsStore } from '@/store/useSettingsStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Settings() {
  const notionToken = useSettingsStore((s) => s.notionToken)
  const setNotionToken = useSettingsStore((s) => s.setNotionToken)
  const notionDatabaseId = useSettingsStore((s) => s.notionDatabaseId)
  const setNotionDatabaseId = useSettingsStore((s) => s.setNotionDatabaseId)

  return (
    <div className="max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Notion integration and preferences. Data is stored locally in your browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notion</CardTitle>
          <CardDescription>
            Share conversations to a Notion database. Create an{" "}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              internal integration
            </a>
            , copy the token, and add the database to your integration. Then paste the database ID (from the database URL).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notion-token">Integration token (secret)</Label>
            <Input
              id="notion-token"
              type="password"
              placeholder="secret_..."
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notion-database-id">Database ID</Label>
            <Input
              id="notion-database-id"
              type="text"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={notionDatabaseId}
              onChange={(e) => setNotionDatabaseId(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              From the database URL: notion.so/workspace/<strong>database-id</strong>?v=...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
