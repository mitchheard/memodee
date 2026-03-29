import { useSettingsStore } from '@/store/useSettingsStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingTextField } from '@/components/settings/SettingTextField'

export function Settings() {
  const openAIKey = useSettingsStore((s) => s.openAIKey)
  const setOpenAIKey = useSettingsStore((s) => s.setOpenAIKey)
  const notionToken = useSettingsStore((s) => s.notionToken)
  const setNotionToken = useSettingsStore((s) => s.setNotionToken)
  const notionDatabaseId = useSettingsStore((s) => s.notionDatabaseId)
  const setNotionDatabaseId = useSettingsStore((s) => s.setNotionDatabaseId)

  return (
    <div className="max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect OpenAI and Notion for search and sharing. Nothing leaves your browser—credentials are stored only on
          this device.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI (semantic search)</CardTitle>
          <CardDescription>
            Optional. Used to embed chats so semantic search can match by meaning (use the Fuzzy | Semantic control in the
            Library). Create a key at{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              platform.openai.com
            </a>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingTextField
            id="openai-key"
            label="OpenAI API Key"
            value={openAIKey}
            onChange={setOpenAIKey}
            placeholder="sk-..."
            inputType="password"
            maskWhenSaved
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notion</CardTitle>
          <CardDescription>
            Send a conversation to a Notion database. Create an{' '}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              internal integration
            </a>
            , copy the token, and give that integration access to your database. Then paste the database ID from the
            database URL below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingTextField
            id="notion-token"
            label="Notion API Token"
            value={notionToken}
            onChange={setNotionToken}
            placeholder="secret_..."
            inputType="password"
            maskWhenSaved
          />
          <SettingTextField
            id="notion-database-id"
            label="Database ID"
            value={notionDatabaseId}
            onChange={setNotionDatabaseId}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            inputType="text"
            hint={
              <p className="text-xs text-muted-foreground">
                From the database URL: notion.so/workspace/<strong>database-id</strong>?v=... Use the ID from the link,
                not the page title.
              </p>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
