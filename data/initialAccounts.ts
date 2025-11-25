
import { Account, ApplicationStatus, Broker } from '../types';

const rawData = ``;

export const parseRawAccountData = (inputData: string): Account[] => {
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]/i;
    // Supports standard 10 digit, or 5-space-5, or with +91 prefix
    const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{9}\b|(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]\d{5}\b/;
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const yearRegex = /\b(19|20)\d{2}\b/;
    const pinRegex = /pin$/i;
    
    // Split by newlines followed by digits and a closing parenthesis OR a dot.
    // Also handles cases where text might just be "1 Name" (less common but possible)
    // This regex looks for: Newline, optional whitespace, Number, then either ) or .
    const blocks = inputData.trim().split(/(?:\r?\n|^)\s*(?=\d+[\)\.])/).map(block => block.trim());

    return blocks.map(block => {
        // Remove the numbering (e.g., "1) ", "1. ") from the first line
        // The split retains the delimiter in some browser implementations if not careful, 
        // but here we are splitting *at* the lookahead, so the number stays in the block.
        // We clean it manually.
        const lines = block.split('\n').map(line => line.trim().replace(/^\d+[\)\.]\s*/, ''));

        // Filter out empty lines resulting from strict splits
        if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) return null;

        const firstLine = lines[0] || '';
        let name = firstLine;
        let broker: Broker = Broker.Unknown;

        if (firstLine.toLowerCase().includes('upstox')) {
            broker = Broker.Upstox;
            name = name.replace(/upstox/i, '').trim();
        } else if (firstLine.toLowerCase().includes('zerodha')) {
            broker = Broker.Zerodha;
            name = name.replace(/zerodha/i, '').trim();
        } else if (firstLine.toLowerCase().includes('groww')) {
            broker = Broker.Groww;
            name = name.replace(/groww/i, '').trim();
        } else if (firstLine.toLowerCase().includes('angle one')) {
            broker = Broker.AngleOne;
            name = name.replace(/angle one/i, '').trim();
        }
        
        const account: Partial<Account> = {
            id: crypto.randomUUID(),
            name: name.trim(),
            broker,
            status: ApplicationStatus.Pending
        };

        const otherLines = lines.slice(1).join('\n');
        
        const panMatch = otherLines.match(panRegex);
        account.pan = panMatch ? panMatch[0].toUpperCase() : undefined;

        const phoneMatch = otherLines.match(phoneRegex);
        // Clean phone number (remove spaces, dashes, +91)
        if (phoneMatch) {
            account.phone = phoneMatch[0].replace(/\D/g, '').slice(-10);
        } else {
            // Attempt to find phone in title line if not found elsewhere
            const titlePhone = firstLine.match(phoneRegex);
            if (titlePhone) {
                 account.phone = titlePhone[0].replace(/\D/g, '').slice(-10);
                 account.name = account.name?.replace(titlePhone[0], '').trim();
            } else {
                 account.phone = ''; 
            }
        }

        const emailMatch = otherLines.match(emailRegex);
        account.email = emailMatch ? emailMatch[0] : undefined;
        
        const yearMatch = otherLines.match(yearRegex);
        account.year = yearMatch ? yearMatch[0] : undefined;
        
        lines.forEach(line => {
             if (pinRegex.test(line)) {
                account.pin = line.replace(pinRegex, '').trim();
             }
        });

        // Heuristic for loginId, pin, and tpin
        const potentialIds = lines.slice(1).flatMap(line => line.split(/\s+/)).filter(part =>
            !phoneRegex.test(part) &&
            !emailRegex.test(part) &&
            !panRegex.test(part) &&
            !yearRegex.test(part) &&
            !/upstox|zerodha|groww|angle|one|through|mobile|app/i.test(part) &&
            part.length > 2 &&
            !account.name?.toLowerCase().split(' ').includes(part.toLowerCase())
        );

        // Simple heuristic: Alphanumeric often login ID, numeric often PIN/TPIN
        if(potentialIds.length > 0 && !account.loginId) {
            const loginCandidate = potentialIds.find(p => /[a-zA-Z]/.test(p) && /[0-9]/.test(p));
            // Assign as Login ID, but strip potential trailing dashes
            if (loginCandidate) {
                 account.loginId = loginCandidate.replace(/-$/, '');
            } else if (potentialIds[0]) {
                 // Fallback: if first item is just text but looks like ID
                 account.loginId = potentialIds[0].replace(/-$/, '');
            }
        }
        
        // Look for potential PINs (4-8 digits)
        const numericCandidates = potentialIds.filter(p => /^\d{4,8}$/.test(p) && p !== account.year && p !== account.phone);
        
        if (numericCandidates.length > 0) {
             if (!account.pin) {
                 account.pin = numericCandidates[0];
             }
             if (numericCandidates.length > 1) {
                 // If we have a second number, it might be TPIN
                 account.tpin = numericCandidates[1];
             }
        }

        return account as Account;
    })
    .filter((acc): acc is Account => acc !== null && !!acc.name && !!acc.phone);
};

export const initialAccounts: Account[] = parseRawAccountData(rawData);
