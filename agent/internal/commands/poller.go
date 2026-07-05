package commands

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type Command struct {
	ID			int64 	`json:"id"`
	TwinID		string  `json:"twin_id"`
	ActionType  string  `json:"action_type"`
	Reason		string  `json:"reason"`
}

type Poller struct {
	BackendURL string
	Client *http.Client
}

func NewPoller(backendURL string) *Poller {
	return &Poller{
		BackendURL: backendURL,
		Client: &http.Client{},
	}
}

func (p *Poller) Claim(twinID string) (*Command, error) {

	url := fmt.Sprintf(
		"%s/commands/claim?twinId=%s",
		p.BackendURL,
		twinID,
	)

	resp, err := p.Client.Get(url)

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNoContent {
		return nil, nil
	}

	var command Command

	err = json.NewDecoder(resp.Body).Decode(&command)

	if err != nil {
		return nil, err
	}

	return &command, nil
}

func (p *Poller) Ack(commandID int64 , success bool) error {
	body := map[string]bool{
		"success" : success,
	}

	data , err := json.Marshal(body)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/commands/%d/ack", p.BackendURL, commandID)

	resp , err := p.Client.Post(
		url,
		"application/json",
		bytes.NewBuffer(data)
	)

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("backend returned status : %d", resp.StatusCode)
	}
	
	return nil
}