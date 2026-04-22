import { Buffer } from "node:buffer";
import { isIP } from "node:net";

const yookassaAllowedRanges = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.156.11/32",
  "77.75.156.35/32",
  "77.75.154.128/25",
  "2a02:5180::/32",
] as const;

function parseIpv4(ip: string) {
  return Buffer.from(
    ip.split(".").map((segment) => Number.parseInt(segment, 10)),
  );
}

function expandIpv6(ip: string) {
  const [leftPart, rightPart] = ip.split("::");
  const left = leftPart ? leftPart.split(":").filter(Boolean) : [];
  const right = rightPart ? rightPart.split(":").filter(Boolean) : [];

  if (ip.includes(".") && right.length) {
    const ipv4Segments = right.pop();

    if (ipv4Segments) {
      const [a, b, c, d] = ipv4Segments.split(".").map((segment) => {
        return Number.parseInt(segment, 10);
      });

      right.push(((a << 8) | b).toString(16));
      right.push(((c << 8) | d).toString(16));
    }
  }

  const missing = 8 - (left.length + right.length);
  return [...left, ...Array.from({ length: missing }, () => "0"), ...right];
}

function parseIpv6(ip: string) {
  const result = Buffer.alloc(16);

  expandIpv6(ip).forEach((segment, index) => {
    result.writeUInt16BE(Number.parseInt(segment, 16), index * 2);
  });

  return result;
}

function cidrContains(ip: string, cidr: string) {
  const [range, prefixText] = cidr.split("/");
  const prefix = Number.parseInt(prefixText, 10);
  const version = isIP(range);
  const ipVersion = isIP(ip);

  if (version === 0 || version !== ipVersion) {
    return false;
  }

  const candidate = version === 4 ? parseIpv4(ip) : parseIpv6(ip);
  const network = version === 4 ? parseIpv4(range) : parseIpv6(range);
  const fullBytes = Math.floor(prefix / 8);
  const remainingBits = prefix % 8;

  for (let index = 0; index < fullBytes; index += 1) {
    if (candidate[index] !== network[index]) {
      return false;
    }
  }

  if (remainingBits === 0) {
    return true;
  }

  const mask = (0xff << (8 - remainingBits)) & 0xff;

  return (
    (candidate[fullBytes] & mask) === (network[fullBytes] & mask)
  );
}

export function isAllowedYookassaWebhookIp(ip: string | null) {
  if (!ip) {
    return false;
  }

  return yookassaAllowedRanges.some((range) => cidrContains(ip, range));
}
