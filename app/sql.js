const database = "3it_burdam23";
const username = "burdam23";
const password = "8JWXcAxtGj";
const server = "localhost";

const SQL_GATEWAY_URL =
  "http://marcincin.epsilon.spstrutnov.cz/gate.php";

export async function sql(sqlQuery) {
  const response = await fetch(SQL_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      database,
      username,
      password,
      server,
      sql: sqlQuery,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `SQL gateway error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}