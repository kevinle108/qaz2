const localTitle = `
<hr class="separatorLine">
<h2 class="localHeader" aria-label="{HEADER_LABEL}">{LOCAL_HEADER}</h2><br>`

function buildLocalTitle(header) { 
  let headerLabel = header.replace(/<br>/g," ")  
  return localTitle.replace("{HEADER_LABEL}", headerLabel)
                   .replace("{LOCAL_HEADER}", header)  
}

const rcRaceHtml = `
  <div class="selectionContest">
    <h2 id="contest_{CONTEST_INDEX}" class="contestName" tabindex="0">
      {CONTEST_NAME}<br>{CONTEST_SUBTITLE}
      <p class="votingInstructions">{VOTING_INSTRUCTIONS}</p>
    </h2>    
    <table class="table" aria-labelledby="contest_{CONTEST_INDEX}">
      <tr class="row header">
          <th scope="col" class="cell">Candidate</th> 
          {RANKS}
      </tr>
      {CANDIDATES}
    </table>
  </div>
` 
const rRaceHtml = `
  <div class="selectionContest">
    <h2 id="contest_{CONTEST_INDEX}" class="contestName" tabindex="0">
      {CONTEST_NAME}<br>{CONTEST_SUBTITLE}
      <p class="votingInstructions">{VOTING_INSTRUCTIONS}</p>         
    </h2>     
    <div class="regCandidates">
      {CANDIDATES}
    </div>
  </div>
`
const rcCandidateHtml = `
  <tr class="row" tabindex="0">
    <th scope="row" class="cell" data-title="Candidate">
      <div class="candidateName">{CANDIDATE_NAME}</div>
      <span class="candidateSubtitle">{CANDIDATE_SUBTITLE}</span>      
    </th>
    {OVALS}
  </tr>
` 

const rcWriteinHtml = `
  <tr class="row">
    <th scope="row" class="cell" data-title="Candidate">
      <div id="{WRITEIN_HEADER_ID}_wh" class="candidateName">Write-in:</div>
      <div id="{WRITEIN_ID}_w" class="writeinName"></div>
    </th>
    {OVALS}
  </tr>
` 

const ovalHtml = `
  <td class="cell">
    <input type="checkbox" id="{OVAL_ID}" class="c2 rcOval" aria-label="{OVAL_ARIA_LABEL}">      
  </td>
`

const candidateRegLine = `
  <div class="indivCandidate" >
    <div class="candidateNameDiv" aria-hidden="true">
      <div class="candidateName">{CANDIDATE_NAME}</div>
      <span class="candidateSubtitle">{CANDIDATE_SUBTITLE}</span>        
    </div>
    <input type="checkbox" id="{OVAL_ID}" class="c2 regularRaceOval" aria-label="{CANDIDATE_ARIA_LABEL}">    
  </div>
`
const candidateRegWriteIn = `
  <div class="indivCandidate">
    <div id="{OVAL_ID}_wh" class="candidateName" aria-hidden="true">Write-in:</div>
    <div id="{OVAL_ID}_w" class="writeinName" aria-hidden="true"></div>
    <input type="checkbox" id="{OVAL_ID}" class="c2 regularRaceOval" aria-label="{WRITEIN_ARIA_LABEL}">
  </div>
`

const qRaceHtml = `
  <div class="selectionContest">
    <h2 id="contest_{CONTEST_INDEX}" class="contestName" tabindex="0">
      {CONTEST_NAME}<br>{CONTEST_SUBTITLE}
      <p class="votingInstructions">{VOTING_INSTRUCTIONS}</p>  	
    </h2>                  
	<div class="questionDiv">
      <p class="question">{QUESTION_TEXT}</p>
      <div class="questionOptionsDiv">
        {QUESTION_OPTIONS}
      </div>
    </div>
  </div>
`

const questionOption = `
  <div class="questionOption candidateLabel">
    <div class="candidateNameDiv" aria-hidden="true">
      <div class="candidateName">{CANDIDATE_NAME}</div>
    </div>
    <input type="checkbox" id="{OVAL_ID}" class="c2 questionRaceOval" aria-label="{OPTION_ARIA_LABEL}">  
  </div>
`

function buildRace(race, raceIndex) {
  let contestXofY = ''
  if (!data.includes('UOCAVA Ballot')) {
	  contestXofY = 'Contest ' + (raceIndex + 1) + ' of ' + ballot.contests.length + '<br>'
  }
  if (race.contestType === 'RC') {
    return buildRankChoiceRace(race, raceIndex, contestXofY)
  } else if (race.contestType === 'Q') {
    return buildQuestionRace(race, raceIndex, contestXofY)
  } else {
    return buildRegRace(race, raceIndex, contestXofY)
  }
}

function buildRegRace(race, raceIndex, contestXofY) {
  let txt = rRaceHtml
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{CONTEST_NAME}/g, contestXofY + race.contestName)
    .replace(/{CONTEST_SUBTITLE}/g, race.contestSubtitle)
    .replace(/{VOTING_INSTRUCTIONS}/g, race.votingInstructions)
    .replace(/{VOTE_LIMIT}/g, race.voteFor)
    .replace(/{CANDIDATES}/g, buildRegCandidates(race, raceIndex))
  return txt
}

function buildRegCandidates(race, raceIndex) {
  let txt = ''
  race.candidates.forEach((candidate, candidateIndex) => {

    if (candidate.candidateCode.includes('writein')) {
      txt += candidateRegWriteIn
        .replace(/{OVAL_ID}/g, raceIndex + '_' + candidateIndex)
        .replace(/{WRITEIN_ARIA_LABEL}/g, buildWriteinAriaLabel(raceIndex, candidateIndex))
    } else {
      txt += candidateRegLine
        .replace(/{CANDIDATE_HEADER_ARIA}/g, buildCandidateAriaLabel(raceIndex, candidateIndex))
        .replace(/{CANDIDATE_NAME}/g, candidate.candidateName)
        .replace(/{OVAL_ID}/g, raceIndex + '_' + candidateIndex)
        .replace(/{CANDIDATE_ARIA_LABEL}/g, buildCandidateAriaLabel(raceIndex, candidateIndex))
        .replace(/{CANDIDATE_SUBTITLE}/g, candidate.candidateSubtitle)
    }
  })
  return txt
}

function buildQuestionOptions(race, raceIndex) {
  let txt = ''
  race.candidates.forEach((candidate, candidateIndex) => {
      txt += questionOption
        .replace(/{CANDIDATE_NAME}/g, candidate.candidateName)
        .replace(/{OVAL_ID}/g, raceIndex + '_' + candidateIndex)
        .replace(/{OPTION_ARIA_LABEL}/g, buildOptionAriaLabel(raceIndex, candidateIndex))
  })
  return txt
}

function buildOptionAriaLabel(raceIndex, candidateIndex) {
  let txt = ''
  txt += ballot.contests[raceIndex].candidates[candidateIndex].candidateName + ' for ' + ballot.contests[raceIndex].contestName

  return txt
}

function buildQuestionRace(race, raceIndex, contestXofY) { 
  let questionText = race.questionText.join('\\n')  
  let txt = qRaceHtml
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{CONTEST_NAME}/g, contestXofY + race.contestName)
    .replace(/{CONTEST_SUBTITLE}/g, race.contestSubtitle)
    .replace(/{VOTING_INSTRUCTIONS}/g, race.votingInstructions)
    .replace(/{QUESTION_TEXT}/g, questionText.replace(/\\n/g, '<br>'))
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{QUESTION_OPTIONS}/g, buildQuestionOptions(race, raceIndex)) 
  return txt
}

function buildRankChoiceRace(race, raceIndex, contestXofY) {
  let choices = race.candidates.length
  let cls = choiceClassName(choices)
  let txt = rcRaceHtml
    .replace(/{CONTEST_INDEX}/g, raceIndex)
    .replace(/{CONTEST_NAME}/g, contestXofY + race.contestName)
    .replace(/{CONTEST_SUBTITLE}/g, race.contestSubtitle)
    .replace(/{VOTING_INSTRUCTIONS}/g, race.votingInstructions)
    .replace(/{RANKS}/g, buildRankHeaders(race))
    .replace(/{CANDIDATES}/g, buildRcCandidates(race, raceIndex))
  return txt
}

function buildRankHeaders(race) {
  const headerHtml = `<th class="cell">
    <div class="choice">{RANK} Choice</div>
  </th>`;
  let html = '';
  let rank = 1;
  race.candidates.forEach(candidate => {
    html += headerHtml.replace(/{RANK}/g, choiceLabel(rank));
    rank++;
  })
  return html;
}

function buildRcCandidates(race, contestIndex) {
  let html = '';
  race.candidates.forEach((candidate, candidateIndex) => {
    if (candidate.candidateCode.includes('writein')) {
      html += rcWriteinHtml.replace(/{WRITEIN_HEADER_ID}/g, `${contestIndex}_${candidateIndex}`)
                         .replace(/{WRITEIN_ID}/g, `${contestIndex}_${candidateIndex}`)
                         .replace(/{OVALS}/g, buildRcCandidateOvals(race, contestIndex, candidateIndex));
                   
    }
    else {
      html += rcCandidateHtml.replace(/{CANDIDATE_NAME}/g, candidate.candidateName)
                   .replace(/{CANDIDATE_NAME_ARIA}/g, candidateInfoString(contestIndex, candidateIndex))
                   .replace(/{CANDIDATE_SUBTITLE}/g, candidate.candidateSubtitle)
                   .replace(/{OVALS}/g, buildRcCandidateOvals(race, contestIndex, candidateIndex));
    }
  })
  return html;
}

function buildRcCandidateOvals(race, raceIndex, candidateIndex) {
  let html = '';
  if (race.candidates[candidateIndex].candidateCode.includes('writein')) {
    for (let rankIndex = 0; rankIndex < race.candidates.length; rankIndex++) {
      html += ovalHtml.replace(/{OVAL_ID}/g, `${raceIndex}_${candidateIndex}_${rankIndex}`)
                      .replace(/{OVAL_ARIA_LABEL}/g, `${choiceLabel(rankIndex+1)} choice Write-in`)
    }
  }
  else {
    for (let rankIndex = 0; rankIndex < race.candidates.length; rankIndex++) {
      html += ovalHtml.replace(/{OVAL_ID}/g, `${raceIndex}_${candidateIndex}_${rankIndex}`)
                      .replace(/{OVAL_ARIA_LABEL}/g, `${choiceLabel(rankIndex+1)} choice ${candidateInfoString(raceIndex, candidateIndex)}`)
    }
  }
  return html;
}


function choiceClassName(choices) {
  let cls
  if (choices < 4)
    cls = 'choices-2-3'
  else if (choices < 6)
    cls = 'choices-4-5'
  else if (choices < 8)
    cls = 'choices-6-7'
  else if (choices < 10)
    cls = 'choices-8-9'
  else
    cls = 'choices-10-plus'
  return cls
}

function choiceLabel(choice) {
  let lbl
  if (choice == 1)
    lbl = '1st'
  else if (choice == 2)
    lbl = '2nd'
  else if (choice == 3)
    lbl = '3rd'
  else
    lbl = choice + 'th'
  return lbl
}

function candidateInfoString(raceIndex, candidateIndex) {
    let txt = ''
    const candidate = ballot.contests[raceIndex].candidates[candidateIndex]
    let candidateName = '';
    if (candidate.candidateCode.includes('writein')) {
      candidateName = "Write-in:";
    }
    else {
      candidateName = candidate.candidateName.replace(/<br>/g, ' and ') + " - " + candidate.candidateSubtitle.replace(/<br>/g, ' ')
    }
    txt += candidateName;
    return txt
}

function shortenedName(raceIndex, candidateIndex) {
  const candidate = ballot.contests[raceIndex].candidates[candidateIndex]
  let split = candidate.candidateName.split('<br>')
  if (split.length > 1) {
    let lastNames = new Array()
    for (let name of split) {
      lastNames.push(name.split(',')[0])
    }
    return lastNames.join(' and ')
  } else {
    return candidate.candidateName
  }
}

function buildCandidateAriaLabel(raceIndex, candidateIndex) {
    let txt = ''
    txt += candidateInfoString(raceIndex, candidateIndex)
    return txt
}

function buildWriteinAriaLabel(raceIndex, candidateIndex) {
    let txt = ''
    txt += 'Write-in'
    return txt
}

function fullNameAria(contestIndex, candidateIndex) {
  const candidate = ballot.contests[contestIndex].candidates[candidateIndex];
  const name = candidate.candidateName;
  const subtitle = candidate.candidateSubtitle;
  const aria = `${name} ${subtitle}`;
  return aria;
}
